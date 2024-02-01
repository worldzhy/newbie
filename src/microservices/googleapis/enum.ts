export enum GoogleAccountRole {
  Writer = 'writer',
  Commenter = 'commenter',
  Reader = 'reader',
}

export enum GoogleFileType {
  Folder = 'Folder',
  Document = 'Document',
  Form = 'Form',
  Sheet = 'Sheet',
  Slide = 'Slide',
}

export enum GoogleMimeType {
  //https://developers.google.com/drive/api/guides/mime-types
  Folder = 'application/vnd.google-apps.folder',
  Document = 'application/vnd.google-apps.document',
  Form = 'application/vnd.google-apps.form',
  Sheet = 'application/vnd.google-apps.spreadsheet',
  Slide = 'application/vnd.google-apps.presentation',
}
