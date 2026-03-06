import type { ReactNode } from "react";
import { activityUrl, advancedUrl, companyRegisterUrl, employeeUrl, inforCompanyUrl } from "../../routes/urls";
import { FaBuilding } from "react-icons/fa";
import { RECRUIT_BASE_ROLE } from "../../constant/roles";
import { MdAppRegistration } from "react-icons/md";
import { FiUser } from "react-icons/fi";
import { FaShieldAlt } from "react-icons/fa";
import { FaHistory } from "react-icons/fa";
import type { IMenuItem } from "./MenuItem"; 
export const defaultMenusAdmin: IMenuItem[] = [
    {
        path: inforCompanyUrl,
        name: 'Infor Company',
        icon: <FaBuilding size={18}/>,
        roles: [RECRUIT_BASE_ROLE.Admin, RECRUIT_BASE_ROLE.Employee]
    },
    {
        path: companyRegisterUrl,
        name: 'Company Requests',
        icon: <MdAppRegistration size={18}/>,
        roles: [RECRUIT_BASE_ROLE.Admin, RECRUIT_BASE_ROLE.Employee]
    },
    {
        path: employeeUrl,
        name: 'Employee',
        icon: <FiUser size={18}/>,
        roles: [RECRUIT_BASE_ROLE.Admin]
    },
    {
        path: advancedUrl,
        name: 'Advanced Security',
        icon: <FaShieldAlt size={18}/>,
        roles: [RECRUIT_BASE_ROLE.Admin]
    },
    {
        path: activityUrl,
        name: 'Activity Logs',
        icon: <FaHistory size={18}/>,
        roles: [RECRUIT_BASE_ROLE.Admin]
    },

    
]