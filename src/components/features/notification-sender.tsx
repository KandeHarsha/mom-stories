'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2, Send, Users, Bell } from 'lucide-react';

interface PushToken {
  userId: string;
  expoPushToken: string;
  phase?: string;
  userName?: string;
  userEmail?: string;
}

const PHASES = [
  { value: 'preparation', label: 'Preparation' },
  { value: 'pregnancy', label: 'Pregnancy' },
  { value: 'post_delivery', label: 'Post Delivery' },
];

export function NotificationSender() {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [tokens, setTokens] = useState('');
  const [selectedPhase, setSelectedPhase] = useState<string>('');
  const [isLoadingTokens, setIsLoadingTokens] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [fetchedUsers, setFetchedUsers] = useState<PushToken[]>([]);

  const getAuthToken = () => {
    return localStorage.getItem('session_token');
  };

  const fetchTokens = async (phase?: string) => {
    setIsLoadingTokens(true);
    setMessage(null);
    
    try {
      const authToken = getAuthToken();
      if (!authToken) {
        setMessage({ type: 'error', text: 'Not authenticated. Please login again.' });
        return;
      }

      const url = phase 
        ? `/api/admin/push-tokens?phase=${phase}` 
        : '/api/admin/push-tokens';
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to fetch tokens');
      }

      const data = await response.json();
      const tokensList: PushToken[] = data.tokens || [];
      
      setFetchedUsers(tokensList);
      
      // Extract unique tokens and set them
      const uniqueTokens = [...new Set(tokensList.map((t) => t.expoPushToken))];
      setTokens(uniqueTokens.join(', '));
      
      if (tokensList.length === 0) {
        setMessage({ type: 'error', text: phase ? `No users found for phase: ${phase}` : 'No users found with push tokens' });
      } else {
        setMessage({ type: 'success', text: `Loaded ${uniqueTokens.length} push token(s) from ${tokensList.length} device(s)` });
      }
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error instanceof Error ? error.message : 'Failed to fetch tokens' 
      });
    } finally {
      setIsLoadingTokens(false);
    }
  };

  const handleSelectAllUsers = () => {
    setSelectedPhase('');
    fetchTokens();
  };

  const handleFetchByPhase = () => {
    if (!selectedPhase) {
      setMessage({ type: 'error', text: 'Please select a phase first' });
      return;
    }
    fetchTokens(selectedPhase);
  };

  const handleSendNotification = async () => {
    if (!title.trim()) {
      setMessage({ type: 'error', text: 'Please enter a notification title' });
      return;
    }
    if (!body.trim()) {
      setMessage({ type: 'error', text: 'Please enter a notification body' });
      return;
    }
    if (!tokens.trim()) {
      setMessage({ type: 'error', text: 'Please enter or select push tokens' });
      return;
    }

    setIsSending(true);
    setMessage(null);

    try {
      const authToken = getAuthToken();
      if (!authToken) {
        setMessage({ type: 'error', text: 'Not authenticated. Please login again.' });
        return;
      }

      // Parse tokens (comma-separated)
      const tokenList = tokens
        .split(',')
        .map((t) => t.trim())
        .filter((t) => t.length > 0);

      if (tokenList.length === 0) {
        setMessage({ type: 'error', text: 'No valid tokens provided' });
        return;
      }

      const response = await fetch('/api/notifications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          to: tokenList.length === 1 ? tokenList[0] : tokenList,
          title: title.trim(),
          body: body.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send notification');
      }

      setMessage({ type: 'success', text: `Notification sent successfully to ${tokenList.length} device(s)!` });
      // Clear form on success
      setTitle('');
      setBody('');
      setTokens('');
      setFetchedUsers([]);
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error instanceof Error ? error.message : 'Failed to send notification' 
      });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center gap-2 mb-6">
        <Bell className="h-6 w-6 text-blue-600" />
        <h2 className="text-xl font-semibold">Send Push Notifications</h2>
      </div>

      <div className="space-y-6">
        {/* Notification Content */}
        <div className="space-y-4">
          <div>
            <Label htmlFor="title">Notification Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter notification title"
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="body">Notification Body</Label>
            <Textarea
              id="body"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Enter notification message"
              className="mt-1"
              rows={3}
            />
          </div>
        </div>

        {/* User Selection */}
        <div className="border-t pt-4">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Select Recipients</h3>
          
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleSelectAllUsers}
              disabled={isLoadingTokens}
              className="flex items-center gap-2"
            >
              {isLoadingTokens ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Users className="h-4 w-4" />
              )}
              Select All Users
            </Button>

            <div className="flex gap-2 flex-1">
              <Select value={selectedPhase} onValueChange={setSelectedPhase}>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Select phase..." />
                </SelectTrigger>
                <SelectContent>
                  {PHASES.map((phase) => (
                    <SelectItem key={phase.value} value={phase.value}>
                      {phase.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Button
                type="button"
                variant="outline"
                onClick={handleFetchByPhase}
                disabled={isLoadingTokens || !selectedPhase}
              >
                {isLoadingTokens ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  'Fetch'
                )}
              </Button>
            </div>
          </div>

          {/* Fetched Users Info */}
          {fetchedUsers.length > 0 && (
            <div className="bg-gray-50 rounded-md p-3 mb-4 text-sm">
              <p className="font-medium text-gray-700 mb-2">
                Selected Users ({fetchedUsers.length}):
              </p>
              <div className="max-h-24 overflow-y-auto space-y-1">
                {fetchedUsers.slice(0, 10).map((user, idx) => (
                  <div key={idx} className="text-gray-600 text-xs">
                    {user.userName || user.userEmail || user.userId}
                    {user.phase && <span className="ml-2 text-gray-400">({user.phase})</span>}
                  </div>
                ))}
                {fetchedUsers.length > 10 && (
                  <div className="text-gray-400 text-xs">
                    ... and {fetchedUsers.length - 10} more
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Tokens Input */}
          <div>
            <Label htmlFor="tokens">Expo Push Tokens</Label>
            <Textarea
              id="tokens"
              value={tokens}
              onChange={(e) => setTokens(e.target.value)}
              placeholder="Enter Expo push tokens (comma-separated) or use the buttons above to fetch"
              className="mt-1 font-mono text-xs"
              rows={3}
            />
            <p className="text-xs text-gray-500 mt-1">
              Enter tokens manually or use the selection buttons above
            </p>
          </div>
        </div>

        {/* Message */}
        {message && (
          <div
            className={`p-3 rounded-md text-sm ${
              message.type === 'success'
                ? 'bg-green-50 text-green-800 border border-green-200'
                : 'bg-red-50 text-red-800 border border-red-200'
            }`}
          >
            {message.text}
          </div>
        )}

        {/* Send Button */}
        <Button
          onClick={handleSendNotification}
          disabled={isSending || !title.trim() || !body.trim() || !tokens.trim()}
          className="w-full"
        >
          {isSending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Sending...
            </>
          ) : (
            <>
              <Send className="h-4 w-4 mr-2" />
              Send Notification
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
