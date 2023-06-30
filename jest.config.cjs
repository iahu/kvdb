/**
 * Sync object
 * @type {import('@jest/types').Config.InitialOptions}
 */
const config = {
    verbose: false,
    roots: ['<rootDir>'],
    projects: ['<rootDir>'],
    moduleFileExtensions: ['js', 'jsx', 'ts', 'tsx', 'json', 'cjs', 'mjs'],
    transform: {
        '^.+\\.tsx?$': 'ts-jest',
    },
    moduleNameMapper: {
        '^@@/(.+)$': '<rootDir>/src/$1',
        '\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$/':
            '<rootDir>/__mocks__/file-mock.js',
        '\\.(css|less|scss)$': '<rootDir>/__mocks__/file-mock.js',
    },
    moduleDirectories: ['node_modules', '<rootDir>/node_modules'],
    globals: {
        navigator: { userAgent: '' },
    },
};

module.exports = config;
