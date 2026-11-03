import { z } from "zod";
import {
  firstNameField,
  lastNameField,
  optionalUrlField,
} from "../common/commonValidations";

export const profileSchema = z.object({
  firstName: firstNameField(),
  lastName: lastNameField(),
  avatarUrl: optionalUrlField,
});
