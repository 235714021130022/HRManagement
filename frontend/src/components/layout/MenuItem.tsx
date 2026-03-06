import type { ReactNode } from "react";
import { candidateUrl, companyRegisterUrl, dashboardUrl, employeeUrl, interviewScheUrl, jobsUrl, recruitmentInforUrl, reportUrl, settingUrl } from "../../routes/urls";
import { FiHome } from "react-icons/fi";
import { RECRUIT_BASE_ROLE } from "../../constant/roles";
import { FaTachometerAlt } from "react-icons/fa";
import { FaBullhorn } from "react-icons/fa";
import { FaUserTie } from "react-icons/fa";
import { FaCalendarAlt } from "react-icons/fa";
import { FaUsers } from "react-icons/fa";
import { FaTasks } from "react-icons/fa";
import { FaChartBar } from "react-icons/fa";
import { FaCog } from "react-icons/fa";
export interface IMenuItem {
    path?: string;
    name: string;
    icon: ReactNode;
    roles: string[];
    children?: IMenuItem[];
}
export const defaultMenus: IMenuItem[] = [
    {
        path: dashboardUrl,
        name: 'Dashboard',
        icon: <FaTachometerAlt size={18} color="#4A5568"/>,
        roles: [RECRUIT_BASE_ROLE.Admin, RECRUIT_BASE_ROLE.Employee, RECRUIT_BASE_ROLE.Employer]
    },
    {
        path: recruitmentInforUrl,
        name: 'Recruitment Posts',
        icon: <FaBullhorn size={18} color="#4A5568" />,
        roles: [RECRUIT_BASE_ROLE.Admin, RECRUIT_BASE_ROLE.Employee, RECRUIT_BASE_ROLE.Employer]
    },
    {
        path: candidateUrl,
        name: 'Candidates',
        icon: <FaUserTie size={18} color="#4A5568"/>,
        roles: [RECRUIT_BASE_ROLE.Admin, RECRUIT_BASE_ROLE.Employee, RECRUIT_BASE_ROLE.Employer]
    },
    {
        path: interviewScheUrl,
        name: 'Calendar',
        icon: <FaCalendarAlt size={18} color="#4A5568"/>,
        roles: [RECRUIT_BASE_ROLE.Admin, RECRUIT_BASE_ROLE.Employee, RECRUIT_BASE_ROLE.Employer]
    },
    // {
    //     path: employeeUrl,
    //     name: 'Employee',
    //     icon: <FaUsers size={18} color="#4A5568"/>,
    //     roles: [RECRUIT_BASE_ROLE.Admin, RECRUIT_BASE_ROLE.Employee, RECRUIT_BASE_ROLE.Employer]
    // },
    {
        path: jobsUrl,
        name: 'Tasks',
        icon: <FaTasks size={18} color="#4A5568"/>,
        roles: [RECRUIT_BASE_ROLE.Admin, RECRUIT_BASE_ROLE.Employee, RECRUIT_BASE_ROLE.Employer]
    },
    {
        path: reportUrl,
        name: 'Reports',
        icon: <FaChartBar size={18} color="#4A5568"/>,
        roles: [RECRUIT_BASE_ROLE.Admin, RECRUIT_BASE_ROLE.Employee, RECRUIT_BASE_ROLE.Employer]
    },
    {
        path: settingUrl,
        name: 'Setting',
        icon: <FaCog size={18} color="#4A5568"/>,
        roles: [RECRUIT_BASE_ROLE.Admin, RECRUIT_BASE_ROLE.Employee, RECRUIT_BASE_ROLE.Employer]
    }
]