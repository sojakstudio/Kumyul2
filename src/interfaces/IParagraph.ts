export default interface IParagraph {
  /**
   * Title of the paragraph
   *
   * Length limit: 256 characters
   */
  title: string;
  /**
   * Content of the field
   *
   * Length limit: 1024 characters
   */
  content: string;
  /**
   * Whether or not this paragraph should display inline
   */
  inline?: boolean;
}
