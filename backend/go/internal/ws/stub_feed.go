package ws

import "github.com/general-exchange/backend/internal/config"

// StartMassiveFeed is deprecated — market data moved to IBKR Python service.
func StartMassiveFeed(_ config.Config, _ *Hub) func() {
	return func() {}
}
