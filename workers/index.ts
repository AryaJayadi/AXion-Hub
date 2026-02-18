// Import all workers -- they self-register on import
import "./audit-worker";
import "./alert-worker";

console.log("[workers] All workers initialized");
