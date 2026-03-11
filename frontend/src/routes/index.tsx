import { createBrowserRouter } from "react-router-dom";
import { RECRUIT_BASE_ROLE } from "../constant/roles";
import {
  candidateDetailUrl,
  candidateUrl,
  companyRegisterUrl,
  dashboardUrl,
  employeeDetailUrl,
  employeeUrl,
  error403Url,
  homeUrl,
  inforCompanyUrl,
  interviewScheUrl,
  jobsDetailUrl,
  jobsUrl,
  layoutUrl,
  loginUrl,
  positionPostUrl,
  potentialCandidateUrl,
  rankUrl,
  recruitmentInforDetailUrl,
  recruitmentInforUrl,
  sendEmailUrl,
  settingUrl,
  skillsUrl
} from "./urls";

import { Home } from "../modules/home/Home";
import { CompanyRegister } from "../modules/company_register/views/CompanyRegister";
import { Employees } from "../modules/employee/views/Employee";
import { InforCompany } from "../modules/inform_company/views/InformationCompany";
import { Recruitment } from "../modules/recruit_inf/views/Recruitment";
import { Candidates } from "../modules/candidate/views/Candidate";
import { Interview_Schedule } from "../modules/interview_schedule/views/Interview_Schedule";
import { Job } from "../modules/job/views/Job";
import { PositionPost } from "../modules/setting/position_post/views/PositionPost";
import { Rank } from "../modules/setting/rank/views/Rank";
import { SendEmail } from "../modules/setting/send_email/views/Email";
import { Skill } from "../modules/setting/skill/views/Skill";

import ProtectedRoute from "../modules/auth/components/ProtectedRoute";
import MainLayout from "../components/layout/MainLayout";
import Error403 from "../components/error/403";
import LoginView from "../modules/auth/view/LoginView";
import EmployeeDetail from "../modules/employee/views/EmployeeDetail";
import RecruitmentDetail from "../modules/recruit_inf/views/RecruitmentDetail";
import CandidateDetailModal from "../modules/candidate/views/CandidateDetail";
import JobDetail from "../modules/job/views/JobDetail";
import Sibar_Report from "../modules/dashboard/views/Sibar_Report";
import General_Sibar from "../modules/setting/General_Sibar";
import { Potential } from "../modules/potential/views/Potential";

export const createRouterConfig = () => {
  const { Admin, Employee, Employer } = RECRUIT_BASE_ROLE;

  return createBrowserRouter([
    {
        path: loginUrl,
        element: <LoginView/>
    },
    {
      path: layoutUrl,
      element: (
         <ProtectedRoute allowedRoles={[Admin, Employee, Employer]}>
          <MainLayout />
         </ProtectedRoute>
      ),
      children: [
        {
          path: homeUrl,
          element: (
              <ProtectedRoute allowedRoles={[Admin, Employee, Employer]}>
              <Home />
             </ProtectedRoute>
          )
        },
        {
          path: dashboardUrl,
          element: (
              <ProtectedRoute allowedRoles={[Admin, Employee, Employer]}>
              <Sibar_Report />
             </ProtectedRoute>
          )
        },
        
        {
          path: companyRegisterUrl,
          element: (
             <ProtectedRoute allowedRoles={[Admin]}>
              <CompanyRegister />
             </ProtectedRoute>
          )
        },
        {
          path: employeeUrl,
          element: (
             <ProtectedRoute allowedRoles={[Admin]}>
              <Employees />
             </ProtectedRoute>
          )
        },
        {
          path: employeeDetailUrl,
          element: (
            <ProtectedRoute allowedRoles={[Admin]}>
              <EmployeeDetail />
            </ProtectedRoute>
          )
        },
        {
          path: inforCompanyUrl,
          element: (
            <ProtectedRoute allowedRoles={[Admin, Employer]}>
              <InforCompany />
            </ProtectedRoute>
          )
        },
        
        {
          path: recruitmentInforUrl,
          element: (
            <ProtectedRoute allowedRoles={[Admin, Employer]}>
              <Recruitment />
            </ProtectedRoute>
          )
        },
        {
          path: recruitmentInforDetailUrl,
          element: (
            <ProtectedRoute allowedRoles={[Admin, Employer]}>
              <RecruitmentDetail />
            </ProtectedRoute>
          )
        },
        {
          path: candidateUrl,
          element: (
            <ProtectedRoute allowedRoles={[Admin, Employee]}>
              <Candidates />
            </ProtectedRoute>
          )
        },
        {
          path: potentialCandidateUrl,
          element: (
            <ProtectedRoute allowedRoles={[Admin, Employee]}>
              <Potential />
            </ProtectedRoute>
          )
        },
        {
          path: candidateDetailUrl,
          element: (
            <ProtectedRoute allowedRoles={[Admin, Employee]}>
              <CandidateDetailModal />
            </ProtectedRoute>
          )
        },
        {
          path: interviewScheUrl,
          element: (
            <ProtectedRoute allowedRoles={[Admin, Employee]}>
              <Interview_Schedule />
            </ProtectedRoute>
          )
        },
        {
          path: jobsUrl,
          element: (
            <ProtectedRoute allowedRoles={[Admin, Employer]}>
              <Job />
            </ProtectedRoute>
          )
        }, 
        {
          path: jobsDetailUrl,
          element: (
            <ProtectedRoute allowedRoles={[Admin, Employer]}>
              <JobDetail />
            </ProtectedRoute>
          )
        },
        {
          path: positionPostUrl,
          element: (
            <ProtectedRoute allowedRoles={[Admin]}>
              <PositionPost />
            </ProtectedRoute>
          )
        },
        {
          path: rankUrl,
          element: (
            <ProtectedRoute allowedRoles={[Admin]}>
              <Rank />
            </ProtectedRoute>
          )
        },
        {
          path: sendEmailUrl,
          element: (
            <ProtectedRoute allowedRoles={[Admin]}>
              <SendEmail />
            </ProtectedRoute>
          )
        },
        {
          path: skillsUrl,
          element: (
            <ProtectedRoute allowedRoles={[Admin]}>
              <Skill />
            </ProtectedRoute>
          )
        }, 
        {
          path: settingUrl,
          element: (
            <ProtectedRoute allowedRoles={[Admin]}>
              <General_Sibar />
            </ProtectedRoute>
          )
        },
      ]
    },
    {
      path: error403Url,
      element: <Error403 />
    },
    {
      path: "*",
      element: <div>404 Not Found</div>
    }
  ]);
};