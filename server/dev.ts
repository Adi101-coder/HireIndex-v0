import { createServer } from "http";
import app from "./index";
import { log } from "./vite";

const server = createServer(app);

// Function to find an available port
const findAvailablePort = async (startPort: number): Promise<number> => {
  const net = await import('net');
  
  return new Promise((resolve, reject) => {
    const server = net.createServer();
    
    server.listen(startPort, () => {
      const port = (server.address() as any).port;
      server.close(() => resolve(port));
    });
    
    server.on('error', (err: any) => {
      if (err.code === 'EADDRINUSE') {
        // Try the next port
        findAvailablePort(startPort + 1).then(resolve).catch(reject);
      } else {
        reject(err);
      }
    });
  });
};

const startServer = async () => {
  try {
    const port = await findAvailablePort(5000);
    server.listen(port, () => {
      log(`Development server running on port ${port}`);
      log(`API available at http://localhost:${port}/api`);
      log(`Frontend available at http://localhost:${port}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer(); 