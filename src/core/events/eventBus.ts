export type GameEventType =
  | 'QUIZ_COMPLETED'
  | 'XP_GAINED'
  | 'ELO_UPDATED'
  | 'BADGE_AWARDED'
  | 'LEVEL_UP'

export type GameEvent = {
  type: GameEventType
  userId: string
  payload: Record<string, unknown>
  timestamp: number
}

type EventHandler = (event: GameEvent) => void | Promise<void>

class EventBus {
  private handlers = new Map<GameEventType, EventHandler[]>()

  on(eventType: GameEventType, handler: EventHandler): void {
    const existing = this.handlers.get(eventType) ?? []
    this.handlers.set(eventType, [...existing, handler])
  }

  off(eventType: GameEventType, handler: EventHandler): void {
    const existing = this.handlers.get(eventType) ?? []
    this.handlers.set(eventType, existing.filter((h) => h !== handler))
  }

  async emit(event: GameEvent): Promise<void> {
    const handlers = this.handlers.get(event.type) ?? []
    await Promise.all(handlers.map((h) => h(event)))
  }
}

export const eventBus = new EventBus()
