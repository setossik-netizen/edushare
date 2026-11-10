-- Seed de la taxonomie scolaire (Bénin / francophonie).
-- Idempotent : peut être rejoué après chaque évolution du programme.

insert into public.levels (slug, label, cycle, order_index) values
  ('ci',          'CI',          'primaire',   10),
  ('cp',          'CP',          'primaire',   20),
  ('ce1',         'CE1',         'primaire',   30),
  ('ce2',         'CE2',         'primaire',   40),
  ('cm1',         'CM1',         'primaire',   50),
  ('cm2',         'CM2',         'primaire',   60),
  ('6eme',        '6e',          'college',    70),
  ('5eme',        '5e',          'college',    80),
  ('4eme',        '4e',          'college',    90),
  ('3eme',        '3e',          'college',   100),
  ('2nde',        '2nde',        'lycee',     110),
  ('1ere',        '1ère',        'lycee',     120),
  ('terminale-a', 'Terminale A', 'lycee',     130),
  ('terminale-c', 'Terminale C', 'lycee',     140),
  ('terminale-d', 'Terminale D', 'lycee',     150),
  ('licence-1',   'Licence 1',   'universite', 160),
  ('licence-2',   'Licence 2',   'universite', 170),
  ('licence-3',   'Licence 3',   'universite', 180)
on conflict (slug) do update set
  label = excluded.label,
  cycle = excluded.cycle,
  order_index = excluded.order_index;

insert into public.subjects (slug, label, icon, order_index) values
  ('mathematiques',     'Mathématiques',     'calculator',    10),
  ('svt',               'SVT',               'dna',           20),
  ('physique-chimie',   'Physique-Chimie',   'atom',          30),
  ('francais',          'Français',          'book-open',     40),
  ('anglais',           'Anglais',           'languages',     50),
  ('histoire-geographie', 'Histoire-Géographie', 'globe',      60),
  ('philosophie',       'Philosophie',       'brain',         70),
  ('economie',          'Économie',          'trending-up',   80),
  ('informatique',      'Informatique',      'cpu',           90)
on conflict (slug) do update set
  label = excluded.label,
  icon = excluded.icon,
  order_index = excluded.order_index;
