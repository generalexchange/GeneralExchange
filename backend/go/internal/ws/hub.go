package ws

import (
	"sync"

	"github.com/gorilla/websocket"
)

// Hub fans out normalized JSON frames to browser WebSocket clients.
type Hub struct {
	mu      sync.RWMutex
	clients map[*websocket.Conn]struct{}
}

func NewHub() *Hub {
	return &Hub{clients: map[*websocket.Conn]struct{}{}}
}

func (h *Hub) Add(conn *websocket.Conn) {
	h.mu.Lock()
	h.clients[conn] = struct{}{}
	h.mu.Unlock()
}

func (h *Hub) Remove(conn *websocket.Conn) {
	h.mu.Lock()
	delete(h.clients, conn)
	h.mu.Unlock()
}

func (h *Hub) Count() int {
	h.mu.RLock()
	defer h.mu.RUnlock()
	return len(h.clients)
}

func (h *Hub) Broadcast(raw []byte) {
	h.mu.RLock()
	defer h.mu.RUnlock()
	for conn := range h.clients {
		_ = conn.SetWriteDeadline(deadline())
		if err := conn.WriteMessage(websocket.TextMessage, raw); err != nil {
			go h.drop(conn)
		}
	}
}

func (h *Hub) drop(conn *websocket.Conn) {
	h.Remove(conn)
	_ = conn.Close()
}
