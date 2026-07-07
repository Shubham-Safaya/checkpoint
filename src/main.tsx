import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import App from "./App";
import HomePage from "./modules/home/HomePage";
import Wizard from "./modules/profile/Wizard";
import TravelPage from "./modules/travel/TravelPage";
import DestinationPage from "./modules/travel/DestinationPage";
import MoneyPage from "./modules/money/MoneyPage";
import EB1ATracker from "./modules/immigration/EB1ATracker";
import MyListPage from "./modules/mylist/MyListPage";
import PathwaysPage from "./modules/pathways/PathwaysPage";
import ImmigrationPage from "./modules/immigration/ImmigrationPage";
import GuidePage from "./modules/immigration/GuidePage";
import "./index.css";

const router = createBrowserRouter(
  [
    {
      path: "/",
      element: <App />,
      children: [
        { index: true, element: <HomePage /> },
        { path: "profile", element: <Wizard /> },
        { path: "travel", element: <TravelPage /> },
        { path: "travel/:id", element: <DestinationPage /> },
        { path: "money", element: <MoneyPage /> },
        { path: "pathways", element: <PathwaysPage /> },
        { path: "immigration", element: <ImmigrationPage /> },
        { path: "immigration/eb1a-tracker", element: <EB1ATracker /> },
        { path: "immigration/:slug", element: <GuidePage /> },
        { path: "my-list", element: <MyListPage /> },
        { path: "*", element: <HomePage /> },
      ],
    },
  ],
  { basename: import.meta.env.BASE_URL }
);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
