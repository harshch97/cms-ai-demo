import { z } from 'zod';

export const createAddressSchema = z.object({
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
});

export const updateAddressSchema = z
  .object({
    house_flat_number: z
      .string()
      .min(1, 'House/Flat number cannot be empty')
      .max(50, 'House/Flat number must be at most 50 characters')
      .optional(),

    building_street: z
      .string()
      .min(1, 'Building/Street name cannot be empty')
      .max(150, 'Building/Street name must be at most 150 characters')
      .optional(),

    locality_area: z
      .string()
      .min(1, 'Locality/Area cannot be empty')
      .max(100, 'Locality/Area must be at most 100 characters')
      .optional(),

    city: z
      .string()
      .min(1, 'City cannot be empty')
      .max(100, 'City must be at most 100 characters')
      .optional(),

    state: z
      .string()
      .min(1, 'State cannot be empty')
      .max(100, 'State must be at most 100 characters')
      .optional(),

    pin_code: z
      .string()
      .regex(/^\d{6}$/, 'PIN code must be exactly 6 digits')
      .optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field must be provided for update',
  });

export const addressIdParamSchema = z.object({
  addressId: z
    .string()
    .regex(/^\d+$/, 'Address ID must be a positive integer')
    .transform(Number),
});

export type CreateAddressInput = z.infer<typeof createAddressSchema>;
export type UpdateAddressInput = z.infer<typeof updateAddressSchema>;
export type AddressIdParam = z.infer<typeof addressIdParamSchema>;
