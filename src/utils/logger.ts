import winston from "winston";

const logFormat = winston.format.combine(winston.format.timestamp(), winston.format.json());

export const logger = winston.createLogger({
  level: "info",
  format: logFormat,
  defaultMeta: { service: "omni-publisher" },
  transports: [
    new winston.transports.File({
      filename: "publish.log",
      level: "info",
    }),
    new winston.transports.Console({
      format: winston.format.combine(winston.format.colorize(), winston.format.simple()),
      level: process.env.NODE_ENV === "production" ? "info" : "debug",
    }),
  ],
});

export const logPublishSuccess = (platform: string, slug: string, url: string) => {
  logger.info("Published successfully", {
    platform,
    slug,
    url,
    event: "publish_success",
  });
};

export const logPublishFailure = (platform: string, slug: string, error: any) => {
  logger.error("Publish failed", {
    platform,
    slug,
    error: error instanceof Error ? error.message : String(error),
    stack: error instanceof Error ? error.stack : undefined,
    event: "publish_failure",
  });
};
