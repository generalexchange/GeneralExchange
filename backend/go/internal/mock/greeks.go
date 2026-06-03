package mock

import "math"

// Greeks holds the first- and second-order Black-Scholes-Merton sensitivities.
// Conventions match src/services/greeksService.ts: vega per 1% vol; theta,
// charm, color per calendar day.
type Greeks struct {
	Price float64
	Delta float64
	Gamma float64
	Theta float64
	Vega  float64
	Rho   float64
	Charm float64
	Vanna float64
	Volga float64
	Speed float64
	Zomma float64
	Color float64
}

func normCDF(x float64) float64 { return 0.5 * (1 + math.Erf(x/math.Sqrt2)) }
func normPDF(x float64) float64 { return math.Exp(-0.5*x*x) / math.Sqrt(2*math.Pi) }

// BSM computes the option price and full Greek surface (dividend-free, q = 0).
func BSM(s, k, t, r, sigma float64, optType string) Greeks {
	isCall := optType == "CALL"
	if t <= 0 || sigma <= 0 {
		intrinsic := math.Max(0, s-k)
		if !isCall {
			intrinsic = math.Max(0, k-s)
		}
		return Greeks{Price: intrinsic}
	}
	const year = 365.0
	sqrtT := math.Sqrt(t)
	d1 := (math.Log(s/k) + (r+0.5*sigma*sigma)*t) / (sigma * sqrtT)
	d2 := d1 - sigma*sqrtT
	disc := math.Exp(-r * t)
	phi := normPDF(d1)

	var delta, price, thetaYr, rho float64
	if isCall {
		delta = normCDF(d1)
		price = s*normCDF(d1) - k*disc*normCDF(d2)
		thetaYr = -(s*phi*sigma)/(2*sqrtT) - r*k*disc*normCDF(d2)
		rho = k * t * disc * normCDF(d2) / 100
	} else {
		delta = normCDF(d1) - 1
		price = k*disc*normCDF(-d2) - s*normCDF(-d1)
		thetaYr = -(s*phi*sigma)/(2*sqrtT) + r*k*disc*normCDF(-d2)
		rho = -k * t * disc * normCDF(-d2) / 100
	}

	gamma := phi / (s * sigma * sqrtT)
	vega := s * phi * sqrtT / 100
	charmYr := -phi * ((2*r*t - d2*sigma*sqrtT) / (2 * t * sigma * sqrtT))
	colorYr := -phi / (2 * s * t * sigma * sqrtT) *
		(2*r*t + 1 + (d1*(2*r*t-d2*sigma*sqrtT))/(sigma*sqrtT))

	return Greeks{
		Price: price, Delta: delta, Gamma: gamma, Theta: thetaYr / year, Vega: vega, Rho: rho,
		Charm: charmYr / year, Vanna: -phi * (d2 / sigma), Volga: vega * (d1 * d2 / sigma),
		Speed: -(gamma / s) * (d1/(sigma*sqrtT) + 1), Zomma: gamma * ((d1*d2 - 1) / sigma), Color: colorYr / year,
	}
}
