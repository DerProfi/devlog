import {defineConfig} from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
    plugins: [react()],
    test: {
        environment: "jsdom",
        globals: true,
        setupFiles: ["@testing-library/jest-dom"],
        coverage: {
            reporter: ["text", "html", "cobertura"],
            thresholds: {
                lines: 85,
                functions: 90,
                branches: 75,
                statements: 90,
            },
        },
        reporters: ["default", "junit"],
        outputFile: {
            junit: "./junit.xml",
        },
    },
});