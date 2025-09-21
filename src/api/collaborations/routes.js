const routes = (handler) => [
  {
    method: "POST",
    path: "/collaborations",
    handler: handler.postCollaborationHandler,
    options: {
      auth: "openmusic_jwt",
    },
  },
  {
    method: "DELETE",
    path: "/collaborations",
    handler: handler.deleteCollaborationHandler,
    options: {
      auth: "openmusic_jwt",
    },
  },
  {
    method: "POST",
    path: "/playlists/{id}/collaborations",
    handler: handler.postCollaborationHandler,
    options: {
      auth: "openmusic_jwt",
    },
  },
  {
    method: "DELETE",
    path: "/playlists/{id}/collaborations",
    handler: handler.deleteCollaborationHandler,
    options: {
      auth: "openmusic_jwt",
    },
  },
];

export default routes;
