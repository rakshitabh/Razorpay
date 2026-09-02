// In-memory data store fallback if MongoDB is not connected
class MemoryStore {
  constructor() {
    this.users = [];
    this.logs = [];
    this.threats = [];
    this.reports = [];
    this.agentExecutions = [];
    this.auditLogs = [];
    this.notes = [];
  }

  clear() {
    this.users = [];
    this.logs = [];
    this.threats = [];
    this.reports = [];
    this.agentExecutions = [];
    this.auditLogs = [];
    this.notes = [];
  }
}

const memoryStore = new MemoryStore();
export default memoryStore;
