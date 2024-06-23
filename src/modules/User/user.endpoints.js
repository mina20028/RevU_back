import { systemRoles } from "../../utils/system-roles.js";

export const endPointsRoles = {
    NORMALUSER: [systemRoles.ADMIN,systemRoles.SUPER_ADMIN,systemRoles.USER],
}