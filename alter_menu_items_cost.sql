-- Add production_cost column to menu_items table
ALTER TABLE public.menu_items
ADD COLUMN IF NOT EXISTS production_cost numeric DEFAULT NULL;

-- Comment on column
COMMENT ON COLUMN public.menu_items.production_cost IS 'Custo de produção do item para cálculo de lucro';
