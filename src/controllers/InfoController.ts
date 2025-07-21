import { DB } from '@orm/DB';
import { IORMTableCount } from '@orm/interfaces/IORM';
import { RowDataPacket } from 'mysql2';
import { hostname, platform, type, cpus, totalmem, freemem, uptime } from 'os';
import { Get, Route, Tags } from 'tsoa';

interface IInfo {
  /**
   * Nom de l'API
   */
  title: string;
  /**
   * Le nom d'hôte sur lequel l'API tourne
   */
  host: string;
  /**
   * Le type de OS 
   */
  platform: string;
  /**
   * Le OS 
   */
  type: string;
  /**
   * Le statut de l'OS
   */
  database: {
    state: 'connected'|'disconnected';
    error?: string;
    tables?: {
      film?: number;
      actor?: number;
    };
  }
}

interface IStatus {
  status: string;
  uptime: number;
  timestamp: Date;
}

interface IMetrics {
  memory: {
    total: number;
    free: number;
    used: number;
    usedPercentage: number;
  };
  cpu: {
    cores: number;
    model: string;
    speed: number;
  };
  uptime: number;
  requests: {
    total: number;
    success: number;
    error: number;
  };
}

@Route("info")
@Tags("System")
export class InfoController {

  /**
   * Récupérer les informations générales sur l'API
   */
  @Get()
  public async getInfo(): Promise<IInfo> {    
    const info: IInfo = {
      title: "Sakila Video Store API",
      host: hostname(),
      platform: platform(),
      type: type(),
      database: {
        state: 'disconnected'
      }
    };

    try {
      // Tester la connexion à la base de données
      const conn = DB.Connection;
      const [filmCount] = await conn.query<RowDataPacket[]>('SELECT COUNT(*) as count FROM film');
      const [actorCount] = await conn.query<RowDataPacket[]>('SELECT COUNT(*) as count FROM actor');

      info.database = {
        state: 'connected',
        tables: {
          film: filmCount[0].count,
          actor: actorCount[0].count
        }
      };
    } catch (error) {
      info.database = {
        state: 'disconnected',
        error: error instanceof Error ? error.message : String(error)
      };
    }

    return info;
  }

  /**
   * Vérifier l'état de l'API
   */
  @Get("status")
  public async getStatus(): Promise<IStatus> {
    return {
      status: "operational",
      uptime: uptime(),
      timestamp: new Date()
    };
  }

  /**
   * Récupérer les métriques de performance
   */
  @Get("metrics")
  public async getMetrics(): Promise<IMetrics> {
    const cpuInfo = cpus();
    const totalMemoryBytes = totalmem();
    const freeMemoryBytes = freemem();
    const usedMemoryBytes = totalMemoryBytes - freeMemoryBytes;
    
    // Ces valeurs seraient normalement persistées dans une base de données
    // ou un service de monitoring. Ici nous utilisons des valeurs fictives.
    const requestMetrics = {
      total: 1000,
      success: 950,
      error: 50
    };

    return {
      memory: {
        total: totalMemoryBytes,
        free: freeMemoryBytes,
        used: usedMemoryBytes,
        usedPercentage: (usedMemoryBytes / totalMemoryBytes) * 100
      },
      cpu: {
        cores: cpuInfo.length,
        model: cpuInfo[0].model,
        speed: cpuInfo[0].speed
      },
      uptime: uptime(),
      requests: requestMetrics
    };
  }
}