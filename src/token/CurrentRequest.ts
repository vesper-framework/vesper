import {Token} from "typedi";
import {Request} from "express";

export const CurrentRequest = new Token<Request>("Request");