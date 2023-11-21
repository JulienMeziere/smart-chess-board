import puppeteer, { Browser, Page } from 'puppeteer';

const { autoLogin, launchGame } = require('./Browser/utilities');

const BROWSER_DATA_DIR = './browserData';
const BROWSER_UTILITIES_PATH = './src/ChessComController/Browser/utilities.js';
const BROWSER_CONSTANTS_PATH = './src/ChessComController/Browser/constants.js';
const BROWSER_CHESS_BOARD_CONTROLLER_PATH = './src/ChessComController/Browser/ChessBoardController.js';

export type ChessComControllerProps = {
  headless?: boolean;
  logBrowser?: boolean;
  logBrowserFilter?: string;
};

class ChessComController {
  browser: Browser | null = null;
  page: Page | null = null;
  static instance: ChessComController | null = null;
  initPromise: Promise<void> | null = null;

  static getInstance(props: ChessComControllerProps) {
    if (!ChessComController.instance) {
      ChessComController.instance = new ChessComController(props);
    }
    return ChessComController.instance;
  }

  static killInstance() {
    ChessComController.instance?.closeBrowser();
    ChessComController.instance = null;
  }

  private constructor(props: ChessComControllerProps) {
    this.init(props);
  }

  private async init({
    headless = true,
    logBrowser = false,
    logBrowserFilter = '',
  }: ChessComControllerProps) {
    let resolve: (() => void) | null = null;
    let reject: ((reason?: any) => void) | null = null;
    this.initPromise = new Promise((res, rej) => {
      resolve = res;
      reject = rej;
    });

    try {
      this.browser = await puppeteer.launch({ headless, userDataDir: BROWSER_DATA_DIR });
      const pages = await this.browser.pages();
      this.page = pages[0] || await this.browser.newPage();

      logBrowser && this.page.on('console', (msg) => {
        const text = msg.text();
        text.includes(logBrowserFilter) && console.log('[Browser Console]', msg.text());
      });
      this.page.on('framenavigated', async (frame) => {
        if (!frame.url().includes('https://www.chess.com/')) return;
        console.log('[ChessComController] Navigated to --->', frame.url());

        try {
          await frame.waitForSelector('body');
          await this.page?.addScriptTag({ path: BROWSER_CONSTANTS_PATH });
          await this.page?.addScriptTag({ path: BROWSER_UTILITIES_PATH });
        } catch (error) {
          console.error('[ChessComController] Error while adding utility script tag:', error);
        }
      });


      await this.login();
    } catch (error) {
      console.error('[ChessComController] Puppeteer browser error:', error);
      reject && (reject as (reason?: any) => void)();
    }

    resolve && (resolve as () => void)();
    this.initPromise = null;
  }

  private async waitForInit() {
    await this.initPromise?.catch();
  }

  private async login() {
    if (!this.page) return;

    await this.page.goto('https://www.chess.com/login');
    if (this.page.url().includes('/home')) {
      console.log('[ChessComController] Already logged in');
      return;
    }

    await this.page.waitForSelector('body');
    await this.page.evaluate(() => {
      autoLogin();
    });

    await this.page.waitForNavigation();
    if (!this.page.url().includes('/home')) {
      throw new Error('Login failed');    
    } else {
      console.log('[ChessComController] Login successful');
    }
  }

  private closeBrowser() {
    this.browser?.close();
  }

  async launchGame() {
    await this.waitForInit();
    if (!this.page) return;

    try {
      await this.page.goto('https://www.chess.com/play/computer');
      await this.page.waitForSelector('body');
      await this.page.evaluate(() => {
        return launchGame();
      });
      await this.page.waitForSelector('.icon-font-chess.chevron-left');
      await this.page.addScriptTag({ path: BROWSER_CHESS_BOARD_CONTROLLER_PATH });
    } catch (error) {
      console.error('[ChessComController] Error while launching game:', error);
    }
  }
}

export default ChessComController;
