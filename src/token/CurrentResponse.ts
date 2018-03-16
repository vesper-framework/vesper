import {Token} from "typedi";
import {Response} from "express";

export const CurrentResponse = new Token<Response>("Response");