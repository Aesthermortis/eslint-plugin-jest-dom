import * as preferChecked from "./prefer-checked.js";
import * as preferEmpty from "./prefer-empty.js";
import * as preferEnabledDisabled from "./prefer-enabled-disabled.js";
import * as preferFocus from "./prefer-focus.js";
import * as preferInDocument from "./prefer-in-document.js";
import * as preferRequired from "./prefer-required.js";
import * as preferToHaveAttribute from "./prefer-to-have-attribute.js";
import * as preferToHaveClass from "./prefer-to-have-class.js";
import * as preferToHaveStyle from "./prefer-to-have-style.js";
import * as preferToHaveTextContent from "./prefer-to-have-text-content.js";
import * as preferToHaveValue from "./prefer-to-have-value.js";

const rules = {
  "prefer-checked": preferChecked,
  "prefer-empty": preferEmpty,
  "prefer-enabled-disabled": preferEnabledDisabled,
  "prefer-focus": preferFocus,
  "prefer-in-document": preferInDocument,
  "prefer-required": preferRequired,
  "prefer-to-have-attribute": preferToHaveAttribute,
  "prefer-to-have-class": preferToHaveClass,
  "prefer-to-have-style": preferToHaveStyle,
  "prefer-to-have-text-content": preferToHaveTextContent,
  "prefer-to-have-value": preferToHaveValue,
};

export default rules;
