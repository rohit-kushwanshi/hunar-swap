import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import usersRouter from "./users";
import skillsRouter from "./skills";
import requestsRouter from "./requests";
import messagesRouter from "./messages";
import dashboardRouter from "./dashboard";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/auth", authRouter);
router.use("/users", usersRouter);
router.use("/skills", skillsRouter);
router.use("/requests", requestsRouter);
router.use("/messages", messagesRouter);
router.use("/dashboard", dashboardRouter);

export default router;
