export interface ControllerFile {

  /** Name of the form field associated with this file. */
  fieldname: string;

  /** Name of the file on the uploader's computer. */
  originalname: string;

  /**
   * Value of the `Content-Transfer-Encoding` header for this file.
   * @deprecated since July 2015
   * @see RFC 7578, Section 4.7
   */
  encoding: string;

  /** Value of the `Content-Type` header for this file. */
  mimetype: string;

  /** Size of the file in bytes. */
  size: number;

  /** `MemoryStorage` only: A Buffer containing the entire file. */
  buffer: Buffer;
}
