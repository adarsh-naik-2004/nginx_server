"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseConfig = parseConfig;
exports.validateConfig = validateConfig;
const promises_1 = __importDefault(require("node:fs/promises"));
const yaml_1 = require("yaml");
const config_schema_1 = require("./config_schema");
function parseConfig(filepath) {
    return __awaiter(this, void 0, void 0, function* () {
        const configContent = yield promises_1.default.readFile(filepath, 'utf-8');
        const confiParsed = (0, yaml_1.parse)(configContent);
        return JSON.stringify(confiParsed);
    });
}
function validateConfig(config) {
    return __awaiter(this, void 0, void 0, function* () {
        const validateConfig = yield config_schema_1.rootConfigSchema.parseAsync(JSON.parse(config));
        return validateConfig;
    });
}
