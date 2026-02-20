import { z } from 'zod';

// ── Shared address sub-schema ─────────────────────────────────────────────────

const addressFieldsSchema = {
  house_flat_number: z
    .string({ required_error: 'House/Flat number is required' })
    .min(1, 'House/Flat number cannot be empty')
    .max(50, 'House/Flat number must be at most 50 characters'),

  building_street: z
    .string({ required_error: 'Building/Street name is required' })
    .min(1, 'Building/Street name cannot be empty')
    .max(150, 'Building/Street name must be at most 150 characters'),

  locality_area: z
    .string({ required_error: 'Locality/Area is required' })
    .min(1, 'Locality/Area cannot be empty')
    .max(100, 'Locality/Area must be at most 100 characters'),

  city: z
    .string({ required_error: 'City is required' })
    .min(1, 'City cannot be empty')
    .max(100, 'City must be at most 100 characters'),

  state: z
    .string({ required_error: 'State is required' })
    .min(1, 'State cannot be empty')
    .max(100, 'State must be at most 100 characters'),

  pin_code: z
    .string({ required_error: 'PIN code is required' })
    .regex(/^\d{6}$/, 'PIN code must be exactly 6 digits'),
};

// ── Customer schemas ──────────────────────────────────────────────────────────

export const createCustomerSchema = z.object({
  full_name: z
    .string({ required_error: 'Full name is required' })
    .min(1, 'Full name cannot be empty')
    .max(150, 'Full name must be at most 150 characters')
    .regex(/^[a-zA-Z\s]+$/, 'Full name must contain only letters and spaces'),

  company_name: z
    .string({ required_error: 'Company name is required' })
    .min(1, 'Company name cannot be empty')
    .max(150, 'Company name must be at most 150 characters'),

  phone_number: z
    .string({ required_error: 'Phone number is required' })
    .min(7, 'Phone number must be at least 7 digits')
    .max(15, 'Phone number must be at most 15 digits')
    .regex(/^\d+$/, 'Phone number must contain only digits'),

  email: z
    .string({ required_error: 'Email is required' })
    .email('Invalid email format')
    .max(255, 'Email must be at most 255 characters')
    .toLowerCase(),

  // Address is required when creating a customer
  address: z.object(addressFieldsSchema, { required_error: 'Address is required' }),
});

export const updateCustomerSchema = z
  .object({
    full_name: z
      .string()
      .min(1, 'Full name cannot be empty')
      .max(150, 'Full name must be at most 150 characters')
      .regex(/^[a-zA-Z\s]+$/, 'Full name must contain only letters and spaces')
      .optional(),

    company_name: z
      .string()
      .min(1, 'Company name cannot be empty')
      .max(150, 'Company name must be at most 150 characters')
      .optional(),

    phone_number: z
      .string()
      .min(7, 'Phone number must be at least 7 digits')
      .max(15, 'Phone number must be at most 15 digits')
      .regex(/^\d+$/, 'Phone number must contain only digits')
      .optional(),

    email: z
      .string()
      .email('Invalid email format')
      .max(255, 'Email must be at most 255 characters')
      .toLowerCase()
      .optional(),

    // Address is optional on update; id targets a specific address to update
    address: z
      .object({
        id: z
          .number({ invalid_type_error: 'Address id must be a number' })
          .int()
          .positive()
          .optional(),
        ...Object.fromEntries(
          Object.entries(addressFieldsSchema).map(([k, v]) => [k, v.optional()])
        ),
      })
      .optional(),
  })
  .refine(
    (data) => {
      const { address, ...customerFields } = data;
      const hasCustomerField = Object.values(customerFields).some((v) => v !== undefined);
      const hasAddressField =
        address !== undefined &&
        Object.entries(address)
          .filter(([k]) => k !== 'id')
          .some(([, v]) => v !== undefined);
      return hasCustomerField || hasAddressField;
    },
    { message: 'At least one field must be provided for update' }
  );

export const customerIdParamSchema = z.object({
  id: z
    .string()
    .regex(/^\d+$/, 'Customer ID must be a positive integer')
    .transform(Number),
});

export const customerListQuerySchema = z.object({
  page: z
    .string()
    .regex(/^\d+$/, 'Page must be a positive integer')
    .transform(Number)
    .default('1'),
  limit: z
    .string()
    .regex(/^\d+$/, 'Limit must be a positive integer')
    .transform(Number)
    .default('10'),
  search: z.string().optional(),
});

export type CreateCustomerInput = z.infer<typeof createCustomerSchema>;
export type UpdateCustomerInput = z.infer<typeof updateCustomerSchema>;
export type CustomerIdParam = z.infer<typeof customerIdParamSchema>;
export type CustomerListQuery = z.infer<typeof customerListQuerySchema>;
