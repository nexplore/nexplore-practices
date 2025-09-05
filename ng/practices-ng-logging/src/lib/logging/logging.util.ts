/* eslint-disable @typescript-eslint/no-use-before-define */
const logTopicConfig = new Map<string, boolean>();

/**
 * Outputs a log message to the console, IF logging for the specified topic is enabled OR logging for ALL topics is enabled.
 *
 * @param topicAndContext The topic of the message and further context for example `log('TheComponentName', 'theMethodeThatWasCalled', messageToLog, {some: 'data'})`
 * @param messages Message or data to log, just like console.log works
 */
export function log(topic: string, context?: string | unknown, ...messages: any[]): void {
    if (typeof context !== 'string') {
        messages.unshift(context);
        context = undefined;
    }
    const topicEnabled = logTopicConfig.get(topic);
    const topicExlicitlyDisabled = topicEnabled === false;
    if (topicEnabled || (logTopicConfig.get('*') && !topicExlicitlyDisabled)) {
        // eslint-disable-next-line no-console
        console.log(
            `%c[Log] %c${topic}%c: ${context ?? ''}`,
            `color: grey`,
            `color: ${getConsoleColor(topic)}`,
            'color: currentColor; font-weight: bold',
            ...messages
        );
    }
}

/**
 * Outputs a log message to the console, IF logging for the specified topic is enabled.
 *
 * @param topic The topic of the message, for example `log('TheComponentName', messageToLog, {some: 'data'})`
 * @param context Further context, for example `log('TheComponentName', 'theMethodeThatWasCalled', messageToLog, {some: 'data'})`
 * @param messages Message or data to log, just like console.log works
 */
export function trace(topic: string, context?: string | unknown, ...messages: any[]): void {
    if (typeof context !== 'string') {
        messages.unshift(context);
        context = undefined;
    }

    const topicEnabled = logTopicConfig.get(topic) || logTopicConfig.get('trace');
    if (topicEnabled) {
        // eslint-disable-next-line no-console
        console.log(
            `%c[Trace] %c${topic}%c: ${context ?? ''}`,
            `color: grey`,
            `color: ${getConsoleColor(topic)}`,
            'color: currentColor; font-weight: bold',
            ...messages
        );
    }
}

export function enableLogTopic(topic: string, enabled = true): void {
    logTopicConfig.set(topic, enabled);
}

/**
 * Configures debug logging
 * Reads out url parameter 'log' and enables the provided log topics. Example: `https://.....?log=externalRedirects,HeaderComponent,...` (Comma separated)
 *
 * To enable ALL log topics, use `*`, eg. `https://.....?log=*`
 *
 * Also provides a method to the window : `window.enableLog(topic: string, enabled: boolean)`, which persists any logging-configurations in local storage
 *
 * Examples:
 * ```ts
 * window.enableLog() // Enables logging ALL topics
 * window.enableLog('AppService', false) // Disables logging for 'AppService'
 * window.enableLog(false) // Completely disable logging
 * ```
 */
export function configureDebugLogging(): void {
    try {
        const params = window.location?.href?.split('?')[1]?.split('&');
        const topics = params
            ?.find((p) => p.startsWith('log='))
            ?.split('=')[1]
            ?.split(',');

        const allTopics = params?.find((p) => p === 'log');

        if (topics) {
            // eslint-disable-next-line no-console
            console.log('%c[Log]%c Enabling logging for topic(s)', 'color: grey', 'color: currentColor', topics);
            topics.forEach((topic) => {
                enableLogTopic(topic, true);
            });
        } else if (allTopics) {
            enableLogTopic('*', true);
        }

        const logConfigStr = localStorage.getItem('log');
        if (logConfigStr) {
            const logConfig = JSON.parse(logConfigStr);
            if (logConfig) {
                // eslint-disable-next-line no-console
                console.log(
                    '%c[Log]%c Applying logging config from local storage',
                    'color: grey',
                    'color: currentColor',
                    logConfig
                );
                Object.entries(logConfig).forEach(([key, v]) => {
                    logTopicConfig.set(key, v as boolean);
                });
            }
        }
        (window as any).enableLog = (topic = '*', enabled = true): void => {
            if (typeof topic !== 'string') {
                if (topic === false) {
                    logTopicConfig.clear();
                    window.localStorage.removeItem('log');
                    // eslint-disable-next-line no-console
                    console.log('%c[Log]%c Disabled logging', 'color: grey', 'color: currentColor');
                    return;
                } else {
                    enabled = topic !== false;
                    topic = '*';
                }
            }

            enableLogTopic(topic, enabled);

            const logConfig = Object.fromEntries(logTopicConfig.entries());
            // eslint-disable-next-line no-console
            console.log('%c[Log]%c Configured logging', 'color: grey', 'color: currentColor', logConfig);
            window.localStorage.setItem('log', JSON.stringify(logConfig));
        };
    } catch (er) {
        // eslint-disable-next-line no-console
        console.warn('%c[Log]%c Could not set up logging', 'color: grey', 'color: currentColor', er);
    }
}

const topicColors: { [key: string]: string } = {};

function getConsoleColor(topic: string): string {
    if (topicColors[topic]) {
        return topicColors[topic];
    }

    const colorNames = ['lightblue', 'gold', 'limegreen', 'fuchsia', 'orange', 'aqua', 'pink'];
    const keys = Object.keys(topicColors);

    const color = (topicColors[topic] = colorNames[keys.length % colorNames.length]);
    return color ?? 'lightblue';
}
