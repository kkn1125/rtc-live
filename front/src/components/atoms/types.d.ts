declare type ButtonColors =
  | "inherit"
  | "primary"
  | "secondary"
  | "success"
  | "error"
  | "info"
  | "warning"
  | undefined;

declare type ButtonVariants = "text" | "outlined" | "contained" | undefined;

declare type AnswerModalType = {
  open: boolean;
  to: string;
  handleClose: () => void;
};
