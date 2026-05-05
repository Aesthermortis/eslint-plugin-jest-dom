import * as preferChecked from "./prefer-checked.js";
import * as preferEmpty from "./prefer-empty.js";
import * as preferEnabledDisabled from "./prefer-enabled-disabled.js";
import * as preferFocus from "./prefer-focus.js";
import * as preferInDocument from "./prefer-in-document.js";
import * as preferPartiallyChecked from "./prefer-partially-checked.js";
import * as preferPartiallyPressed from "./prefer-partially-pressed.js";
import * as preferPressed from "./prefer-pressed.js";
import * as preferRequired from "./prefer-required.js";
import * as preferToBeInvalid from "./prefer-to-be-invalid.js";
import * as preferToBeValid from "./prefer-to-be-valid.js";
import * as preferToAppearAfter from "./prefer-to-appear-after.js";
import * as preferToAppearBefore from "./prefer-to-appear-before.js";
import * as preferToHaveAccessibleErrorMessage from "./prefer-to-have-accessible-error-message.js";
import * as preferToHaveAttribute from "./prefer-to-have-attribute.js";
import * as preferToHaveClass from "./prefer-to-have-class.js";
import * as preferToHaveRole from "./prefer-to-have-role.js";
import * as preferToHaveSelection from "./prefer-to-have-selection.js";
import * as preferToHaveStyle from "./prefer-to-have-style.js";
import * as preferToHaveTextContent from "./prefer-to-have-text-content.js";
import * as preferToHaveValue from "./prefer-to-have-value.js";

const rules = {
  "prefer-checked": preferChecked,
  "prefer-empty": preferEmpty,
  "prefer-enabled-disabled": preferEnabledDisabled,
  "prefer-focus": preferFocus,
  "prefer-in-document": preferInDocument,
  "prefer-partially-checked": preferPartiallyChecked,
  "prefer-partially-pressed": preferPartiallyPressed,
  "prefer-pressed": preferPressed,
  "prefer-required": preferRequired,
  "prefer-to-be-invalid": preferToBeInvalid,
  "prefer-to-be-valid": preferToBeValid,
  "prefer-to-appear-after": preferToAppearAfter,
  "prefer-to-appear-before": preferToAppearBefore,
  "prefer-to-have-accessible-error-message": preferToHaveAccessibleErrorMessage,
  "prefer-to-have-attribute": preferToHaveAttribute,
  "prefer-to-have-class": preferToHaveClass,
  "prefer-to-have-role": preferToHaveRole,
  "prefer-to-have-selection": preferToHaveSelection,
  "prefer-to-have-style": preferToHaveStyle,
  "prefer-to-have-text-content": preferToHaveTextContent,
  "prefer-to-have-value": preferToHaveValue,
};

export default rules;
