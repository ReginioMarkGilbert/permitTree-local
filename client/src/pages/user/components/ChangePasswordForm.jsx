import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useChangePassword } from '../hooks/useChangePassword';
import { toast } from 'sonner';
import { Eye, EyeOff } from 'lucide-react';

const ChangePasswordForm = ({ onClose }) => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { changePassword, loading } = useChangePassword();

  // Add state for form validity
  const [isValid, setIsValid] = useState(false);
  const [showPasswordRequirements, setShowPasswordRequirements] = useState(false);

  // Add validation states
  const [validations, setValidations] = useState({
    length: false,
    uppercase: false,
    number: false
  });

  // Real-time password validation
  useEffect(() => {
    setValidations({
      length: newPassword.length >= 8,
      uppercase: /[A-Z]/.test(newPassword),
      number: /[0-9]/.test(newPassword)
    });
  }, [newPassword]);

  // Update isValid based on all requirements
  useEffect(() => {
    setIsValid(
      currentPassword &&
      newPassword &&
      confirmPassword &&
      Object.values(validations).every(Boolean)
    );
  }, [currentPassword, newPassword, confirmPassword, validations]);

  // Add onFocus handler
  const handleNewPasswordFocus = () => {
    setShowPasswordRequirements(true);
  };

  const handleNewPasswordBlur = () => {
    setShowPasswordRequirements(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Check password length first
    if (newPassword.length < 8) {
      toast.error('New password must be at least 8 characters long');
      return;
    }

    // Then check password match
    if (newPassword !== confirmPassword) {
      toast.error('New password and confirm password do not match');
      return;
    }

    try {
      await changePassword({
        variables: {
          input: {
            currentPassword,
            newPassword,
            confirmPassword
          }
        }
      });
      toast.success('Password changed successfully');
      onClose();
    } catch (err) {
      toast.error(err.message || 'Failed to change password');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4" role="form" data-testid="password-form">
      <div className="space-y-2">
        <Label htmlFor="currentPassword">Current Password</Label>
        <div className="relative">
          <Input
            id="currentPassword"
            type={showCurrentPassword ? 'text' : 'password'}
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            required
            className="pr-10"
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
            onClick={() => setShowCurrentPassword(!showCurrentPassword)}
          >
            {showCurrentPassword ? (
              <EyeOff className="h-4 w-4 text-gray-500" />
            ) : (
              <Eye className="h-4 w-4 text-gray-500" />
            )}
          </Button>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="newPassword">New Password</Label>
        <div className="relative">
          <Input
            id="newPassword"
            type={showNewPassword ? 'text' : 'password'}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            onFocus={handleNewPasswordFocus}
            onBlur={handleNewPasswordBlur}
            required
            className="pr-10"
            aria-label="New Password"
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
            onClick={() => setShowNewPassword(!showNewPassword)}
          >
            {showNewPassword ? (
              <EyeOff className="h-4 w-4 text-gray-500" />
            ) : (
              <Eye className="h-4 w-4 text-gray-500" />
            )}
          </Button>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirmPassword">Confirm New Password</Label>
        <div className="relative">
          <Input
            id="confirmPassword"
            type={showConfirmPassword ? 'text' : 'password'}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            className="pr-10"
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
          >
            {showConfirmPassword ? (
              <EyeOff className="h-4 w-4 text-gray-500" />
            ) : (
              <Eye className="h-4 w-4 text-gray-500" />
            )}
          </Button>
        </div>
      </div>

      {showPasswordRequirements && (
        <div className="text-sm text-muted-foreground space-y-1" data-testid="password-requirements">
          <p>New password must:</p>
          <ul className="space-y-1">
            <li className="flex items-center gap-2">
              <div className={`w-1.5 h-1.5 rounded-full ${validations.length ? 'bg-green-500' : 'bg-red-500'}`} />
              <span className={validations.length ? 'text-green-600' : 'text-muted-foreground'}>
                Be at least 8 characters long
              </span>
            </li>
            <li className="flex items-center gap-2">
              <div className={`w-1.5 h-1.5 rounded-full ${validations.uppercase ? 'bg-green-500' : 'bg-red-500'}`} />
              <span className={validations.uppercase ? 'text-green-600' : 'text-muted-foreground'}>
                Include at least one uppercase letter
              </span>
            </li>
            <li className="flex items-center gap-2">
              <div className={`w-1.5 h-1.5 rounded-full ${validations.number ? 'bg-green-500' : 'bg-red-500'}`} />
              <span className={validations.number ? 'text-green-600' : 'text-muted-foreground'}>
                Include at least one number
              </span>
            </li>
          </ul>
        </div>
      )}

      <div className="flex justify-end space-x-4">
        <Button variant="outline" type="button" onClick={onClose}>
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={!isValid || loading}
          data-testid="submit-button"
        >
          {loading ? 'Changing...' : 'Change Password'}
        </Button>
      </div>
    </form>
  );
};

export default ChangePasswordForm;
