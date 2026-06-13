import Dashboard from './pages/Dashboard';
import Projects from './pages/Projects';
import Assistant from './pages/Assistant';
import Editor from './pages/Editor';
import SEOManager from './pages/SEOManager';
import Pricing from './pages/Pricing';
import Analytics from './pages/Analytics';
import AdminPanel from './pages/AdminPanel';
import ShareView from './pages/ShareView';
import VersionHistory from './pages/VersionHistory';
import UsageTracking from './pages/UsageTracking';
import TeamManager from './pages/TeamManager';
import ABTesting from './pages/ABTesting';
import ExportHub from './pages/ExportHub';
import SavedTemplates from './pages/SavedTemplates';
import DomainManager from './pages/DomainManager';
import WebsiteCloner from './pages/WebsiteCloner';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Dashboard": Dashboard,
    "Projects": Projects,
    "Assistant": Assistant,
    "Editor": Editor,
    "SEOManager": SEOManager,
    "Pricing": Pricing,
    "Analytics": Analytics,
    "AdminPanel": AdminPanel,
    "ShareView": ShareView,
    "VersionHistory": VersionHistory,
    "UsageTracking": UsageTracking,
    "TeamManager": TeamManager,
    "ABTesting": ABTesting,
    "ExportHub": ExportHub,
    "SavedTemplates": SavedTemplates,
    "DomainManager": DomainManager,
    "WebsiteCloner": WebsiteCloner,
}

export const pagesConfig = {
    mainPage: "Dashboard",
    Pages: PAGES,
    Layout: __Layout,
};