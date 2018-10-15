import { ErrorHandler } from "../../src";

const chakram = require("chakram");
const expect = chakram.expect;

describe("ErrorHandler Decorator", () => {
  const classHandler = (err: any) => {
    return "Handled by class handler";
  };

  const methodHandler = (err: any) => {
    if (err.message === "throws twice") {
      throw err;
    }
    return "Handled by method handler";
  };

  @ErrorHandler(classHandler)
  class TestClass {
    unhandledMethod() {
      throw new Error("should be handled by class handler");
    }

    @ErrorHandler(methodHandler)
    handledAtMethod() {
      throw new Error("should handled by error handler");
    }

    @ErrorHandler(methodHandler)
    handledAndThrownAgain() {
      throw new Error("throws twice");
    }
  }
  const test = new TestClass();

  it("should work as expected ", async () => {
    expect(await test.unhandledMethod()).to.eql("Handled by class handler");
    expect(await test.handledAtMethod()).to.eql("Handled by method handler");
    expect(await test.handledAndThrownAgain()).to.eql("Handled by class handler");
  });

  it("should throw error if used on a param", () => {
    try {
      class Test {
        method(@ErrorHandler((err: any) => {}) param: any) {}
      }
      throw new Error("Failed");
    } catch (err) {
      expect(err.message).to.eql("Error Handler decorator cannot be used as param decorator");
    }
  });
});
