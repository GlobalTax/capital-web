-- Use the existing create_temporary_user function to add l.linares@nrro.es as admin
SELECT public.create_temporary_user(
    'l.linares@nrro.es', 
    'L. Linares', 
    'admin'::admin_role
);