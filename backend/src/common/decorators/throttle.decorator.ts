import { SetMetadata } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';

// Custom throttle decorators for different endpoint types
export const AuthThrottle = () => Throttle({ default: { limit: 5, ttl: 900000 } }); // 5 requests per 15 minutes
export const RegisterThrottle = () => Throttle({ default: { limit: 3, ttl: 900000 } }); // 3 requests per 15 minutes
export const ChatThrottle = () => Throttle({ default: { limit: 60, ttl: 60000 } }); // 60 requests per minute
export const ApiThrottle = () => Throttle({ default: { limit: 100, ttl: 60000 } }); // 100 requests per minute
export const StrictThrottle = () => Throttle({ default: { limit: 10, ttl: 60000 } }); // 10 requests per minute
