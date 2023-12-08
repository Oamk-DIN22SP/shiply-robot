import express, { Application, json } from "express";
import morgan from 'morgan';
import Routes from './routes';
import cors from "cors";

export default class Server {
  constructor(app: Application) {
    this.config(app);
    new Routes(app);
  }

  private config(app: Application): void {
    app.use(cors());
    app.use(morgan('dev'));
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
  }
}
