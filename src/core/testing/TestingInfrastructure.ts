// ============= TESTING INFRASTRUCTURE =============
// Utilidades centralizadas para testing

import { conditionalLogger } from '../logging/ConditionalLogger';

export interface TestResult {
  name: string;
  passed: boolean;
  message: string;
  data?: unknown;
  duration?: number;
}

export interface TestSuite {
  name: string;
  tests: TestResult[];
  totalTests: number;
  passedTests: number;
  failedTests: number;
  duration: number;
}

class TestingInfrastructure {
  private static instance: TestingInfrastructure;
  private testSuites: Map<string, TestSuite> = new Map();
  private isTestingMode = false;

  private constructor() {}

  static getInstance(): TestingInfrastructure {
    if (!TestingInfrastructure.instance) {
      TestingInfrastructure.instance = new TestingInfrastructure();
    }
    return TestingInfrastructure.instance;
  }

  /**
   * Habilitar modo testing
   */
  enableTestingMode(): void {
    this.isTestingMode = true;
    conditionalLogger.info('Testing mode enabled', { context: 'system' });
  }

  /**
   * Deshabilitar modo testing
   */
  disableTestingMode(): void {
    this.isTestingMode = false;
    conditionalLogger.info('Testing mode disabled', { context: 'system' });
  }

  /**
   * Crear un nuevo test suite
   */
  createTestSuite(name: string): TestSuite {
    const suite: TestSuite = {
      name,
      tests: [],
      totalTests: 0,
      passedTests: 0,
      failedTests: 0,
      duration: 0
    };

    this.testSuites.set(name, suite);
    return suite;
  }

  /**
   * Ejecutar un test individual
   */
  async runTest<T>(
    suiteName: string,
    testName: string,
    testFn: () => Promise<T> | T,
    options?: { timeout?: number; expectedResult?: T }
  ): Promise<TestResult> {
    if (!this.isTestingMode) {
      throw new Error('Testing mode not enabled');
    }

    const startTime = performance.now();
    let result: TestResult;

    try {
      const timeout = options?.timeout || 5000;
      const testResult = await Promise.race([
        Promise.resolve(testFn()),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Test timeout')), timeout)
        )
      ]);

      const passed = options?.expectedResult 
        ? JSON.stringify(testResult) === JSON.stringify(options.expectedResult)
        : true;

      result = {
        name: testName,
        passed,
        message: passed ? 'Test passed' : 'Test failed - unexpected result',
        data: testResult,
        duration: performance.now() - startTime
      };

    } catch (error) {
      result = {
        name: testName,
        passed: false,
        message: `Test failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        duration: performance.now() - startTime
      };
    }

    // Agregar resultado al suite
    const suite = this.testSuites.get(suiteName);
    if (suite) {
      suite.tests.push(result);
      suite.totalTests++;
      if (result.passed) {
        suite.passedTests++;
      } else {
        suite.failedTests++;
      }
      suite.duration += result.duration || 0;
    }

    conditionalLogger.info(`Test ${result.passed ? 'PASSED' : 'FAILED'}: ${testName}`, {
      context: 'system',
      data: result
    });

    return result;
  }

  /**
   * Ejecutar todos los tests de un suite
   */
  async runTestSuite(suiteName: string): Promise<TestSuite> {
    const suite = this.testSuites.get(suiteName);
    if (!suite) {
      throw new Error(`Test suite "${suiteName}" not found`);
    }

    conditionalLogger.info(`Running test suite: ${suiteName}`, { context: 'system' });

    const results = {
      ...suite,
      duration: suite.tests.reduce((total, test) => total + (test.duration || 0), 0)
    };

    conditionalLogger.info(`Test suite completed: ${suiteName}`, {
      context: 'system',
      data: {
        total: results.totalTests,
        passed: results.passedTests,
        failed: results.failedTests,
        duration: results.duration
      }
    });

    return results;
  }

  /**
   * Obtener resultados de un test suite
   */
  getTestSuite(name: string): TestSuite | undefined {
    return this.testSuites.get(name);
  }

  /**
   * Obtener todos los test suites
   */
  getAllTestSuites(): TestSuite[] {
    return Array.from(this.testSuites.values());
  }

  /**
   * Limpiar todos los tests
   */
  clearTests(): void {
    this.testSuites.clear();
    conditionalLogger.info('All test suites cleared', { context: 'system' });
  }

  /**
   * Generar reporte de testing
   */
  generateReport(): {
    totalSuites: number;
    totalTests: number;
    totalPassed: number;
    totalFailed: number;
    totalDuration: number;
    suites: TestSuite[];
  } {
    const suites = this.getAllTestSuites();
    
    return {
      totalSuites: suites.length,
      totalTests: suites.reduce((sum, suite) => sum + suite.totalTests, 0),
      totalPassed: suites.reduce((sum, suite) => sum + suite.passedTests, 0),
      totalFailed: suites.reduce((sum, suite) => sum + suite.failedTests, 0),
      totalDuration: suites.reduce((sum, suite) => sum + suite.duration, 0),
      suites
    };
  }
}

// Export singleton
export const testingInfrastructure = TestingInfrastructure.getInstance();

// Helper functions
export const createTestSuite = (name: string) => testingInfrastructure.createTestSuite(name);
export const runTest = <T>(suiteName: string, testName: string, testFn: () => Promise<T> | T, options?: { timeout?: number; expectedResult?: T }) => 
  testingInfrastructure.runTest(suiteName, testName, testFn, options);
export const enableTesting = () => testingInfrastructure.enableTestingMode();
export const disableTesting = () => testingInfrastructure.disableTestingMode();

export default testingInfrastructure;