enum DecoratorTypes {
  Class = 0,
  Method = 1,
  Param = 2,
}

type AnyFunction = (...args: any[]) => any;

const inferDecoratorType = (name: any, descriptor: any): DecoratorTypes => {
  if (!name) {
    return DecoratorTypes.Class;
  }
  if (typeof descriptor === 'object') {
    return DecoratorTypes.Method;
  }
  return DecoratorTypes.Param;
};

export function ErrorHandler(handleFn: (err: any) => any) {
  return function wrapped(target: any, name?: any, descriptor?: any) {
    const type = inferDecoratorType(name, descriptor);

    if (type === DecoratorTypes.Param) {
      throw new Error('Error Handler decorator cannot be used as param decorator');
    }

    const applyHandler = (method: AnyFunction) => {
      return async (...args: any[]) => {
        try {
          return await method(...args);
        } catch (err) {
          return handleFn(err);
        }
      };
    };

    const wrapMethod = (descriptor: any) => {
      const method = descriptor.value;
      descriptor.value = applyHandler(method);
    };

    const wrap = (target: any, methodName: any) => {
      const method = target.prototype[methodName];
      target.prototype[methodName] = applyHandler(method);
    };

    if (type === DecoratorTypes.Method) {
      wrapMethod(descriptor);
    } else {
      Object.getOwnPropertyNames(target.prototype)
        .filter(x => x !== 'constructor' && typeof target.prototype[x] === 'function')
        .forEach(methodName => wrap(target, methodName));
    }
  };
}
