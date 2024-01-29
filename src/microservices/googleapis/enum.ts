export enum GoogleAccountRole {
  Writer = 'writer',
  Commenter = 'commenter',
  Reader = 'reader',
}

export enum GoogleMimeType {
  //https://developers.google.com/drive/api/guides/mime-types
  Folder = 'application/vnd.google-apps.folder',
  Doc = 'application/vnd.google-apps.document',
  Sheet = 'application/vnd.google-apps.spreadsheet',
  Form = 'application/vnd.google-apps.form',
  Slide = 'application/vnd.google-apps.presentation',
}
