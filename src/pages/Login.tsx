import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';
import { Button, Input, Form, Card } from 'antd';
import { useTranslation } from 'react-i18next';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required')
});

type LoginForm = z.infer<typeof loginSchema>;

export function Login() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = React.useState(false);
  const { t } = useTranslation();
  const { control, handleSubmit, formState: { errors } } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema)
  });

  const onSubmit = async (data: LoginForm) => {
    try {
      setIsLoading(true);
      const { error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

      if (error) {
        if (error.message.includes('Invalid login credentials')) {
          toast.error(t('auth.invalidCredentials'));
        } else {
          toast.error(t('auth.signInError'));
        }
        return;
      }

      navigate('/');
      toast.success(t('auth.signInSuccess'));
    } catch (error) {
      console.error('Login error:', error);
      toast.error(t('common.error'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <Card className="w-full max-w-md">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold">{t('auth.signIn')}</h2>
        </div>

        <Form layout="vertical" onFinish={handleSubmit(onSubmit)}>
          <Form.Item
            label={t('auth.email')}
            validateStatus={errors.email ? 'error' : ''}
            help={errors.email?.message}
          >
            <Controller
              name="email"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  type="email"
                  autoComplete="email"
                  placeholder={t('auth.emailPlaceholder')}
                />
              )}
            />
          </Form.Item>

          <Form.Item
            label={t('auth.password')}
            validateStatus={errors.password ? 'error' : ''}
            help={errors.password?.message}
          >
            <Controller
              name="password"
              control={control}
              render={({ field }) => (
                <Input.Password
                  {...field}
                  autoComplete="current-password"
                  placeholder={t('auth.passwordPlaceholder')}
                />
              )}
            />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              className="w-full"
              loading={isLoading}
              disabled={isLoading}
            >
              {t('auth.signIn')}
            </Button>
          </Form.Item>

          <div className="text-center">
            <p className="text-sm text-gray-600">
              {t('auth.noAccount')}{' '}
              <Link to="/signup" className="font-medium text-blue-600 hover:text-blue-500">
                {t('auth.signUp')}
              </Link>
            </p>
          </div>
        </Form>
      </Card>
    </div>
  );
}

export default Login;