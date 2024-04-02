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

export enum GoogleFileBaseURL {
  Folder = 'https://drive.google.com/drive/folders/',
  Document = 'https://docs.google.com/document/d/',
  Form = 'https://docs.google.com/forms/d/',
  Sheet = 'https://docs.google.com/spreadsheets/d/',
  Slide = 'https://docs.google.com/presentation/d/',
}

export enum GoogleMimeType {
  //https://developers.google.com/drive/api/guides/mime-types
  Folder = 'application/vnd.google-apps.folder',
  Document = 'application/vnd.google-apps.document',
  Form = 'application/vnd.google-apps.form',
  Sheet = 'application/vnd.google-apps.spreadsheet',
  Slide = 'application/vnd.google-apps.presentation',
}
