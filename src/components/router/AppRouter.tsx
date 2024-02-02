import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

// no lazy loading for auth pages to avoid flickering
const AuthLayout = React.lazy(() => import('@app/components/layouts/AuthLayout/AuthLayout'));
import LoginPage from '@app/pages/LoginPage';
import SignUpPage from '@app/pages/SignUpPage';
import ForgotPasswordPage from '@app/pages/ForgotPasswordPage';
import SecurityCodePage from '@app/pages/SecurityCodePage';
import NewPasswordPage from '@app/pages/NewPasswordPage';
import LockPage from '@app/pages/LockPage';

import MainLayout from '@app/components/layouts/main/MainLayout/MainLayout';
import ProfileLayout from '@app/components/profile/ProfileLayout';
import RequireAuth from '@app/components/router/RequireAuth';
import { withLoading } from '@app/hocs/withLoading.hoc';
import NftDashboardPage from '@app/pages/DashboardPages/NftDashboardPage';
import MedicalDashboardPage from '@app/pages/DashboardPages/MedicalDashboardPage';
import AddUserPage from '@app/pages/AddUserPage';
import UserListPage from '@app/pages/UserListPage';
import AddCoursePage from '@app/pages/courses/AddCoursePage';
import ListCoursePage from '@app/pages/courses/ListCoursePage';
import AddCourseGroupPage from '@app/pages/course-group/AddCourseGroupPage';
import ListCourseGroupPage from '@app/pages/course-group/ListCourseGroupPage';
import ListCourseSectionPage from '@app/pages/course-section/ListCourseSectionPage';
import ListCourseUnitPage from '@app/pages/course-unit/ListCourseUnitPage';
import DetailCourseUnitPage from '@app/pages/course-unit/DetailCourseUnitPage';
import AddLessonPage from '@app/pages/lessons/AddLessonPage';
import AddExercisePage from '@app/pages/exercises/AddExercisePage';
import AddExamPage from '@app/pages/exam/AddExamPage';
import ListExamPage from '@app/pages/exam/ListExamPage';
import AddArticlePage from '@app/pages/articles/AddArticlePage';
import ListArticlePage from '@app/pages/articles/ListArticlePage';

const NewsFeedPage = React.lazy(() => import('@app/pages/NewsFeedPage'));
const DataTablesPage = React.lazy(() => import('@app/pages/DataTablesPage'));
const ChartsPage = React.lazy(() => import('@app/pages/ChartsPage'));
const ServerErrorPage = React.lazy(() => import('@app/pages/ServerErrorPage'));
const Error404Page = React.lazy(() => import('@app/pages/Error404Page'));
const AdvancedFormsPage = React.lazy(() => import('@app/pages/AdvancedFormsPage'));
const PersonalInfoPage = React.lazy(() => import('@app/pages/PersonalInfoPage'));
const SecuritySettingsPage = React.lazy(() => import('@app/pages/SecuritySettingsPage'));
const NotificationsPage = React.lazy(() => import('@app/pages/NotificationsPage'));
const PaymentsPage = React.lazy(() => import('@app/pages/PaymentsPage'));
const ButtonsPage = React.lazy(() => import('@app/pages/uiComponentsPages/ButtonsPage'));
const SpinnersPage = React.lazy(() => import('@app/pages/uiComponentsPages/SpinnersPage'));
const AvatarsPage = React.lazy(() => import('@app/pages/uiComponentsPages/dataDisplay/AvatarsPage'));
const BadgesPage = React.lazy(() => import('@app/pages/uiComponentsPages/dataDisplay/BadgesPage'));
const CollapsePage = React.lazy(() => import('@app/pages/uiComponentsPages/dataDisplay/CollapsePage'));
const PaginationPage = React.lazy(() => import('@app/pages/uiComponentsPages/dataDisplay/PaginationPage'));
const ModalsPage = React.lazy(() => import('@app/pages/uiComponentsPages/modals/ModalsPage'));
const PopoversPage = React.lazy(() => import('@app/pages/uiComponentsPages/modals/PopoversPage'));
const PopconfirmsPage = React.lazy(() => import('@app/pages/uiComponentsPages/modals/PopconfirmsPage'));
const ProgressPage = React.lazy(() => import('@app/pages/uiComponentsPages/feedback/ProgressPage'));
const ResultsPage = React.lazy(() => import('@app/pages/uiComponentsPages/feedback/ResultsPage'));
const AlertsPage = React.lazy(() => import('@app/pages/uiComponentsPages/feedback/AlertsPage'));
const SkeletonsPage = React.lazy(() => import('@app/pages/uiComponentsPages/feedback/SkeletonsPage'));
const InputsPage = React.lazy(() => import('@app/pages/uiComponentsPages/forms/InputsPage'));
const CheckboxesPage = React.lazy(() => import('@app/pages/uiComponentsPages/forms/CheckboxesPage'));
const RadiosPage = React.lazy(() => import('@app/pages/uiComponentsPages/forms/RadiosPage'));
const SelectsPage = React.lazy(() => import('@app/pages/uiComponentsPages/forms/SelectsPage'));
const SwitchesPage = React.lazy(() => import('@app/pages/uiComponentsPages/forms/SwitchesPage'));
const UploadsPage = React.lazy(() => import('@app/pages/uiComponentsPages/forms/UploadsPage'));
const RatesPage = React.lazy(() => import('@app/pages/uiComponentsPages/forms/RatesPage'));
const AutoCompletesPage = React.lazy(() => import('@app/pages/uiComponentsPages/forms/AutoCompletesPage'));
const StepsPage = React.lazy(() => import('@app/pages/uiComponentsPages/forms/StepsPage'));
const DateTimePickersPage = React.lazy(() => import('@app/pages/uiComponentsPages/forms/DateTimePickersPage'));
const DropdownsPage = React.lazy(() => import('@app/pages/uiComponentsPages/DropdownsPage'));
const BreadcrumbsPage = React.lazy(() => import('@app/pages/uiComponentsPages/navigation/BreadcrumbsPage'));
const TabsPage = React.lazy(() => import('@app/pages/uiComponentsPages/navigation/TabsPage'));
const NotificationsUIPage = React.lazy(() => import('@app/pages/uiComponentsPages/feedback/NotificationsPage'));
const GoogleMaps = React.lazy(() => import('@app/pages/maps/GoogleMapsPage/GoogleMapsPage'));
const LeafletMaps = React.lazy(() => import('@app/pages/maps/LeafletMapsPage/LeafletMapsPage'));
const ReactSimpleMaps = React.lazy(() => import('@app/pages/maps/ReactSimpleMapsPage/ReactSimpleMapsPage'));
const PigeonsMaps = React.lazy(() => import('@app/pages/maps/PigeonsMapsPage/PigeonsMapsPage'));
const Logout = React.lazy(() => import('./Logout'));

export const NFT_DASHBOARD_PATH = '/';
export const MEDICAL_DASHBOARD_PATH = '/medical-dashboard';

const MedicalDashboard = withLoading(MedicalDashboardPage);
const NftDashboard = withLoading(NftDashboardPage);
const NewsFeed = withLoading(NewsFeedPage);
const AdvancedForm = withLoading(AdvancedFormsPage);

// UI Components
const Buttons = withLoading(ButtonsPage);
const Spinners = withLoading(SpinnersPage);
const Inputs = withLoading(InputsPage);
const Checkboxes = withLoading(CheckboxesPage);
const Radios = withLoading(RadiosPage);
const Selects = withLoading(SelectsPage);
const Switches = withLoading(SwitchesPage);
const Uploads = withLoading(UploadsPage);
const Rates = withLoading(RatesPage);
const AutoCompletes = withLoading(AutoCompletesPage);
const Steps = withLoading(StepsPage);
const DateTimePickers = withLoading(DateTimePickersPage);
const Dropdowns = withLoading(DropdownsPage);
const Breadcrumbs = withLoading(BreadcrumbsPage);
const Tabs = withLoading(TabsPage);
const Avatars = withLoading(AvatarsPage);
const Badges = withLoading(BadgesPage);
const Collapse = withLoading(CollapsePage);
const Pagination = withLoading(PaginationPage);
const Modals = withLoading(ModalsPage);
const Popovers = withLoading(PopoversPage);
const Popconfirms = withLoading(PopconfirmsPage);
const Progress = withLoading(ProgressPage);
const Results = withLoading(ResultsPage);
const Alerts = withLoading(AlertsPage);
const NotificationsUI = withLoading(NotificationsUIPage);
const Skeletons = withLoading(SkeletonsPage);

const DataTables = withLoading(DataTablesPage);
const Charts = withLoading(ChartsPage);

// Maps
const Google = withLoading(GoogleMaps);
const Leaflet = withLoading(LeafletMaps);
const ReactSimple = withLoading(ReactSimpleMaps);
const Pigeons = withLoading(PigeonsMaps);

const ServerError = withLoading(ServerErrorPage);
const Error404 = withLoading(Error404Page);

// Profile
const PersonalInfo = withLoading(PersonalInfoPage);
const SecuritySettings = withLoading(SecuritySettingsPage);
const Notifications = withLoading(NotificationsPage);
const Payments = withLoading(PaymentsPage);

const AuthLayoutFallback = withLoading(AuthLayout);
const LogoutFallback = withLoading(Logout);
const AddUser = withLoading(AddUserPage);
const UserList = withLoading(UserListPage);
const AddExam = withLoading(AddExamPage);
const ListExam = withLoading(ListExamPage);
const AddArticle = withLoading(AddArticlePage);
const ListArticle = withLoading(ListArticlePage);
const AddCourse = withLoading(AddCoursePage);
const ListCourse = withLoading(ListCoursePage);
const ListCourseSection = withLoading(ListCourseSectionPage);
const ListCourseUnit = withLoading(ListCourseUnitPage);
const DetailCourseUnit = withLoading(DetailCourseUnitPage);
const AddLesson = withLoading(AddLessonPage);
const AddExercise = withLoading(AddExercisePage);
const AddCourseGroup = withLoading(AddCourseGroupPage);
const ListCourseGroup = withLoading(ListCourseGroupPage);

export const AppRouter: React.FC = () => {
  const protectedLayout = (
    <RequireAuth>
      <MainLayout />
    </RequireAuth>
  );

  return (
    <BrowserRouter>
      <Routes>
        <Route path={NFT_DASHBOARD_PATH} element={protectedLayout}>
          <Route
            index
            element={
              <RequireAuth>
                <NftDashboard />
              </RequireAuth>
            }
          />
          <Route
            path={MEDICAL_DASHBOARD_PATH}
            element={
              <RequireAuth>
                <MedicalDashboard />
              </RequireAuth>
            }
          />
          <Route path="apps">
            <Route
              path="feed"
              element={
                <RequireAuth>
                  <NewsFeed />
                </RequireAuth>
              }
            />
          </Route>
          <Route path="forms">
            <Route
              path="advanced-forms"
              element={
                <RequireAuth>
                  <AdvancedForm />
                </RequireAuth>
              }
            />
          </Route>
          <Route path="users">
            <Route
              path="add-user"
              element={
                <RequireAuth>
                  <AddUser />
                </RequireAuth>
              }
            />
            <Route
              path="list"
              element={
                <RequireAuth>
                  <UserList />
                </RequireAuth>
              }
            />
            <Route
              path="detail/:id"
              element={
                <RequireAuth>
                  <AddUser />
                </RequireAuth>
              }
            />
          </Route>
          <Route path="courses">
            <Route
              path="add-course"
              element={
                <RequireAuth>
                  <AddCourse />
                </RequireAuth>
              }
            />
            <Route
              path="list"
              element={
                <RequireAuth>
                  <ListCourse />
                </RequireAuth>
              }
            />
            <Route path="detail/:courseId">
              <Route path="sections">
                <Route path=":sectionId/units">
                  <Route path=":unitId">
                    <Route
                      path=""
                      element={
                        <RequireAuth>
                          <DetailCourseUnit />
                        </RequireAuth>
                      }
                    />
                    <Route
                      path="lessons/create"
                      element={
                        <RequireAuth>
                          <AddLesson />
                        </RequireAuth>
                      }
                    />
                    <Route
                      path="lessons/:lessonId"
                      element={
                        <RequireAuth>
                          <AddLesson />
                        </RequireAuth>
                      }
                    />
                    <Route
                      path="exercises/create"
                      element={
                        <RequireAuth>
                          <AddExercise />
                        </RequireAuth>
                      }
                    />
                    <Route
                      path="exercises/:exerciseId"
                      element={
                        <RequireAuth>
                          <AddExercise />
                        </RequireAuth>
                      }
                    />
                  </Route>

                  <Route
                    path=""
                    element={
                      <RequireAuth>
                        <ListCourseUnit />
                      </RequireAuth>
                    }
                  />
                </Route>
                <Route
                  path=""
                  element={
                    <RequireAuth>
                      <ListCourseSection />
                    </RequireAuth>
                  }
                />
              </Route>
              <Route
                path=""
                element={
                  <RequireAuth>
                    <AddCourse />
                  </RequireAuth>
                }
              />
            </Route>
          </Route>
          <Route path="courseGroup">
            <Route
              path="add-courseGroup"
              element={
                <RequireAuth>
                  <AddCourseGroup />
                </RequireAuth>
              }
            />
            <Route
              path="list"
              element={
                <RequireAuth>
                  <ListCourseGroup />
                </RequireAuth>
              }
            />
            <Route
              path="detail/:id"
              element={
                <RequireAuth>
                  <AddCourseGroup />
                </RequireAuth>
              }
            />
          </Route>
          <Route path="Exams">
            <Route
              path="add-exam"
              element={
                <RequireAuth>
                  <AddExam />
                </RequireAuth>
              }
            />
            <Route
              path="list"
              element={
                <RequireAuth>
                  <ListExam />
                </RequireAuth>
              }
            />
            <Route
              path="detail/:examId"
              element={
                <RequireAuth>
                  <AddExam />
                </RequireAuth>
              }
            />
          </Route>
          <Route path="Articles">
            <Route
              path="add-article"
              element={
                <RequireAuth>
                  <AddArticle />
                </RequireAuth>
              }
            />
            <Route
              path="list"
              element={
                <RequireAuth>
                  <ListArticle />
                </RequireAuth>
              }
            />
            <Route
              path="detail/:articleId"
              element={
                <RequireAuth>
                  <AddArticle />
                </RequireAuth>
              }
            />
          </Route>
          <Route
            path="data-tables"
            element={
              <RequireAuth>
                <DataTables />
              </RequireAuth>
            }
          />
          <Route
            path="charts"
            element={
              <RequireAuth>
                <Charts />
              </RequireAuth>
            }
          />
          <Route path="maps">
            <Route
              path="google-maps"
              element={
                <RequireAuth>
                  <Google />
                </RequireAuth>
              }
            />
            <Route
              path="leaflet-maps"
              element={
                <RequireAuth>
                  <Leaflet />
                </RequireAuth>
              }
            />
            <Route
              path="react-simple-maps"
              element={
                <RequireAuth>
                  <ReactSimple />
                </RequireAuth>
              }
            />
            <Route
              path="pigeon-maps"
              element={
                <RequireAuth>
                  <Pigeons />
                </RequireAuth>
              }
            />
          </Route>
          <Route
            path="server-error"
            element={
              <RequireAuth>
                <ServerError />
              </RequireAuth>
            }
          />
          <Route
            path="404"
            element={
              <RequireAuth>
                <Error404 />
              </RequireAuth>
            }
          />
          <Route
            path="profile"
            element={
              <RequireAuth>
                <ProfileLayout />{' '}
              </RequireAuth>
            }
          >
            <Route
              path="personal-info"
              element={
                <RequireAuth>
                  <PersonalInfo />
                </RequireAuth>
              }
            />
            <Route
              path="security-settings"
              element={
                <RequireAuth>
                  <SecuritySettings />
                </RequireAuth>
              }
            />
            <Route
              path="notifications"
              element={
                <RequireAuth>
                  <Notifications />
                </RequireAuth>
              }
            />
            <Route
              path="payments"
              element={
                <RequireAuth>
                  <Payments />
                </RequireAuth>
              }
            />
          </Route>
          <Route path="ui-components">
            <Route
              path="button"
              element={
                <RequireAuth>
                  <Buttons />
                </RequireAuth>
              }
            />
            <Route
              path="spinner"
              element={
                <RequireAuth>
                  <Spinners />
                </RequireAuth>
              }
            />
            <Route
              path="input"
              element={
                <RequireAuth>
                  <Inputs />
                </RequireAuth>
              }
            />
            <Route
              path="checkbox"
              element={
                <RequireAuth>
                  <Checkboxes />
                </RequireAuth>
              }
            />
            <Route
              path="radio"
              element={
                <RequireAuth>
                  <Radios />
                </RequireAuth>
              }
            />
            <Route
              path="select"
              element={
                <RequireAuth>
                  <Selects />
                </RequireAuth>
              }
            />
            <Route
              path="switch"
              element={
                <RequireAuth>
                  <Switches />
                </RequireAuth>
              }
            />
            <Route
              path="upload"
              element={
                <RequireAuth>
                  <Uploads />
                </RequireAuth>
              }
            />
            <Route
              path="rate"
              element={
                <RequireAuth>
                  <Rates />
                </RequireAuth>
              }
            />
            <Route
              path="auto-complete"
              element={
                <RequireAuth>
                  <AutoCompletes />
                </RequireAuth>
              }
            />
            <Route
              path="steps"
              element={
                <RequireAuth>
                  <Steps />
                </RequireAuth>
              }
            />
            <Route
              path="date-time-picker"
              element={
                <RequireAuth>
                  <DateTimePickers />
                </RequireAuth>
              }
            />
            <Route
              path="dropdown"
              element={
                <RequireAuth>
                  <Dropdowns />
                </RequireAuth>
              }
            />
            <Route
              path="breadcrumbs"
              element={
                <RequireAuth>
                  <Breadcrumbs />
                </RequireAuth>
              }
            />
            <Route
              path="tabs"
              element={
                <RequireAuth>
                  <Tabs />
                </RequireAuth>
              }
            />
            <Route
              path="avatar"
              element={
                <RequireAuth>
                  <Avatars />
                </RequireAuth>
              }
            />
            <Route
              path="badge"
              element={
                <RequireAuth>
                  <Badges />
                </RequireAuth>
              }
            />
            <Route
              path="collapse"
              element={
                <RequireAuth>
                  <Collapse />
                </RequireAuth>
              }
            />
            <Route
              path="pagination"
              element={
                <RequireAuth>
                  <Pagination />
                </RequireAuth>
              }
            />
            <Route
              path="modal"
              element={
                <RequireAuth>
                  <Modals />
                </RequireAuth>
              }
            />
            <Route
              path="popover"
              element={
                <RequireAuth>
                  <Popovers />
                </RequireAuth>
              }
            />
            <Route
              path="popconfirm"
              element={
                <RequireAuth>
                  <Popconfirms />
                </RequireAuth>
              }
            />
            <Route
              path="progress"
              element={
                <RequireAuth>
                  <Progress />
                </RequireAuth>
              }
            />
            <Route
              path="result"
              element={
                <RequireAuth>
                  <Results />
                </RequireAuth>
              }
            />
            <Route
              path="alert"
              element={
                <RequireAuth>
                  <Alerts />
                </RequireAuth>
              }
            />
            <Route
              path="notification"
              element={
                <RequireAuth>
                  <NotificationsUI />
                </RequireAuth>
              }
            />
            <Route
              path="skeleton"
              element={
                <RequireAuth>
                  <Skeletons />
                </RequireAuth>
              }
            />
          </Route>
        </Route>
        <Route path="/auth" element={<AuthLayoutFallback />}>
          <Route path="login" element={<LoginPage />} />
          <Route path="sign-up" element={<SignUpPage />} />
          <Route path="lock" element={<LockPage />} />
          <Route path="forgot-password" element={<ForgotPasswordPage />} />
          <Route path="security-code" element={<SecurityCodePage />} />
          <Route path="new-password" element={<NewPasswordPage />} />
        </Route>
        <Route path="/logout" element={<LogoutFallback />} />
      </Routes>
    </BrowserRouter>
  );
};
