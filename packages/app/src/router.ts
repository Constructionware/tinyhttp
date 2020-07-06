import { METHODS } from 'http'
import { Request } from './request'
import { Response } from './response'

export type NextFunction = (err?: any) => void

export type SyncHandler = (req: Request, res: Response, next?: NextFunction) => void

export type AsyncHandler = (req: Request, res: Response, next?: NextFunction) => Promise<void>

export type Handler = AsyncHandler | SyncHandler

export type Method = typeof METHODS[number]

type MiddlewareType = 'mw' | 'route'
export interface Middleware {
  method?: Method
  handler: Handler
  path?: string
  type: MiddlewareType
}

type MethodHandler = {
  path?: string | Handler
  handler?: Handler
  type: MiddlewareType
}

const createMiddlewareFromRoute = ({
  path,
  handler,
  method
}: MethodHandler & {
  method?: Method
}) => ({
  method,
  handler: handler || (path as Handler),
  path: typeof path === 'string' ? path : '/'
})

const pushMiddleware = (mw: Middleware[]) => ({
  path,
  handler,
  method,
  handlers,
  type
}: MethodHandler & {
  method?: Method
  handlers?: Handler[]
}) => {
  const m = createMiddlewareFromRoute({ path, handler, method, type })

  const waresFromHandlers: { handler: Handler }[] = handlers.map(handler => ({ handler }))

  for (const mdw of [m, ...waresFromHandlers]) {
    mw.push({ ...mdw, type })
  }
}

export class Router {
  middleware: Middleware[]

  get(path: string | Handler, handler?: Handler, ...handlers: Handler[]) {
    pushMiddleware(this.middleware)({ path, handler, handlers, method: 'GET', type: 'route' })

    return this
  }
  post(path: string | Handler, handler?: Handler, ...handlers: Handler[]) {
    pushMiddleware(this.middleware)({ path, handler, handlers, method: 'POST', type: 'route' })
    return this
  }
  put(path: string | Handler, handler?: Handler, ...handlers: Handler[]) {
    pushMiddleware(this.middleware)({ path, handler, handlers, method: 'PUT', type: 'route' })
    return this
  }
  patch(path: string | Handler, handler?: Handler, ...handlers: Handler[]) {
    pushMiddleware(this.middleware)({ path, handler, handlers, method: 'PATCH', type: 'route' })
    return this
  }
  head(path: string | Handler, handler?: Handler, ...handlers: Handler[]) {
    pushMiddleware(this.middleware)({ path, handler, handlers, method: 'HEAD', type: 'route' })
    return this
  }
  all(path: string | Handler, handler?: Handler, ...handlers: Handler[]) {
    for (const method of METHODS) {
      pushMiddleware(this.middleware)({ path, handler, handlers, method, type: 'route' })
    }
    return this
  }
  use(path: string | Handler, handler?: Handler, ...handlers: Handler[]) {
    pushMiddleware(this.middleware)({ path, handler: typeof path === 'string' ? handler : path, handlers, type: 'mw' })
    return this
  }
}