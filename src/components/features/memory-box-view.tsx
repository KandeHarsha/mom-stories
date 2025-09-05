// src/components/features/memory-box-view.tsx
'use client';
import React, { useState, useTransition, useRef, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Box, ImagePlus, Mic, Loader2, Paperclip, X, Square, AlertCircle, PlusCircle, Trash2, BookText, Music } from 'lucide-react';
import Image from 'next/image';
import { useToast } from '@/hooks/use-toast';
import { type Memory } from '@/services/memory-service';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const mimeTypeToFileExtension: { [key: string]: string } = {
  'audio/webm': 'webm',
  'audio/mp4': 'mp4',
  'audio/m4a': 'm4a',
  'audio/ogg': 'ogg',
  'audio/wav': 'wav',
  'audio/aac': 'aac',
  'audio/mpeg': 'mp3',
};


export default function MemoryBoxView() {
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const [isSaving, startSaveTransition] = useTransition();
  const [isLoading, startLoadingTransition] = useTransition();
  const [isDeleting, startDeleteTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [memories, setMemories] = useState<Memory[]>([]);
  const [isNewMemoryOpen, setIsNewMemoryOpen] = useState(false);
  const [selectedMemory, setSelectedMemory] = useState<Memory | null>(null);

  // Image state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Audio state
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const [micPermission, setMicPermission] = useState<boolean | null>(null);

  const getAuthHeaders = () => {
    const token = localStorage.getItem('session_token');
    return {
      'Authorization': `Bearer ${token}`,
    };
  };

  const fetchMemories = () => {
    startLoadingTransition(async () => {
      try {
        const response = await fetch('/api/memories', {
          headers: getAuthHeaders(),
        });
        if (!response.ok) {
          throw new Error('Failed to fetch memories');
        }
        const fetchedMemories = await response.json();
        setMemories(fetchedMemories);
      } catch (error) {
        toast({
          variant: 'destructive',
          title: 'Oh no! Something went wrong.',
          description: 'Failed to fetch your memories.',
        });
      }
    });
  };

  useEffect(() => {
    fetchMemories();
  }, []);

  useEffect(() => {
    if (searchParams.get('action') === 'add') {
      setIsNewMemoryOpen(true);
    }
  }, [searchParams]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    setSelectedFile(file);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    if (file) {
      setPreviewUrl(URL.createObjectURL(file));
    } else {
      setPreviewUrl(null);
    }
  };

  const handleRemoveFile = () => {
      setSelectedFile(null);
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
        setPreviewUrl(null);
      }
      if(fileInputRef.current) {
        fileInputRef.current.value = '';
      }
  }

 const handleStartRecording = async () => {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        streamRef.current = stream;
        setMicPermission(true);

        const options = { mimeType: 'audio/webm' };
        let supportedMimeType = 'audio/webm';
        if (MediaRecorder.isTypeSupported('audio/mp4')) {
            supportedMimeType = 'audio/mp4';
        }

        mediaRecorderRef.current = new MediaRecorder(stream, { mimeType: supportedMimeType });
        audioChunksRef.current = [];

        mediaRecorderRef.current.ondataavailable = (event) => {
            audioChunksRef.current.push(event.data);
        };

        mediaRecorderRef.current.onstop = () => {
            const blob = new Blob(audioChunksRef.current, { type: supportedMimeType });
            setAudioBlob(blob);
            const url = URL.createObjectURL(blob);
            setAudioUrl(url);
            
            // Stop the tracks to release the microphone
            if (streamRef.current) {
                streamRef.current.getTracks().forEach(track => track.stop());
                streamRef.current = null;
            }
        };

        mediaRecorderRef.current.start();
        setIsRecording(true);
    } catch (err) {
        console.error("Error accessing microphone:", err);
        setMicPermission(false);
        toast({
            variant: "destructive",
            title: "Microphone Access Denied",
            description: "Please enable microphone permissions in your browser settings.",
        });
    }
  };

  const handleStopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleRemoveAudio = () => {
    setAudioBlob(null);
    if(audioUrl) {
        URL.revokeObjectURL(audioUrl);
        setAudioUrl(null);
    }
  }

  const resetForm = () => {
    formRef.current?.reset();
    handleRemoveFile();
    handleRemoveAudio();
    setIsRecording(false);
    setMicPermission(null);
  };

  const handleSave = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    if(selectedFile){
      formData.append('image', selectedFile);
    }
    if(audioBlob){
      const fileExtension = mimeTypeToFileExtension[audioBlob.type] || 'webm';
      formData.append('voiceNote', audioBlob, `voice-note.${fileExtension}`);
    }
    
    startSaveTransition(async () => {
      try {
        const response = await fetch('/api/memories', {
            method: 'POST',
            headers: getAuthHeaders(),
            body: formData,
        });
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.details || 'Failed to save memory');
        }
        toast({
          title: 'Memory Saved!',
          description: 'Your memory has been saved successfully.',
        });
        resetForm();
        fetchMemories();
        setIsNewMemoryOpen(false);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        toast({
          variant: 'destructive',
          title: 'Oh no! Something went wrong.',
          description: errorMessage,
        });
      }
    });
  };

  const handleDelete = (memoryId: string) => {
    startDeleteTransition(async () => {
        try {
            const response = await fetch(`/api/memories/${memoryId}`, {
                method: 'DELETE',
                 headers: getAuthHeaders(),
            });
             if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to delete memory');
            }
            toast({
                title: 'Memory Deleted',
                description: 'Your memory has been deleted.',
            });
            fetchMemories();
            setSelectedMemory(null);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
            toast({
                variant: 'destructive',
                title: 'Oh no! Something went wrong.',
                description: errorMessage,
            });
        }
    });
  }

  const renderCardContent = (memory: Memory) => {
    if (memory.imageUrl) {
      return (
        <div className="aspect-square w-full overflow-hidden">
          <Image
            src={memory.imageUrl}
            alt={memory.title}
            width={400}
            height={400}
            data-ai-hint="memory"
            className="aspect-square object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
          />
        </div>
      )
    }
    if (memory.voiceNoteUrl) {
      return (
        <div className="flex flex-col items-center justify-center h-full p-4 bg-secondary">
          <Music className="w-16 h-16 text-primary" />
          <p className="mt-4 text-center text-muted-foreground">Voice Note</p>
        </div>
      )
    }
    return (
      <div className="flex flex-col items-center justify-center h-full p-4 bg-secondary">
        <BookText className="w-16 h-16 text-primary" />
        <p className="mt-4 text-center text-muted-foreground line-clamp-4">{memory.text}</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
            <h2 className="text-3xl font-bold font-headline tracking-tight flex items-center gap-2">
                <Box className="h-8 w-8 text-primary"/>
                Digital Memory Box
            </h2>
            <p className="text-muted-foreground mt-1">
                Your private, secure vault for every precious keepsake and milestone.
            </p>
        </div>
        <Dialog open={isNewMemoryOpen} onOpenChange={setIsNewMemoryOpen}>
            <DialogTrigger asChild>
                <Button className="mt-4 md:mt-0">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Upload a Memory
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[625px] max-h-[90vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Box className="h-6 w-6 text-primary"/>
                        Create a New Memory
                    </DialogTitle>
                    <DialogDescription>
                        What precious moment do you want to save? Click save when you're done.
                    </DialogDescription>
                </DialogHeader>
                 <form onSubmit={handleSave} ref={formRef} className="flex-grow overflow-hidden flex flex-col">
                    <div className="flex-grow overflow-y-auto pr-4 -mr-4 space-y-6 py-4">
                        <div className="space-y-2">
                           <Label htmlFor="title">Title</Label>
                           <Input id="title" name="title" placeholder="e.g., First ultrasound, a funny quote..." required/>
                        </div>
                         <div className="space-y-2">
                           <Label htmlFor="text">Your memory (if no photo/voice)</Label>
                           <Textarea id="text" name="text" placeholder="Describe the memory..." rows={4}/>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                           <div className="space-y-2">
                               <Label htmlFor="image">Add a photo</Label>
                                <Button variant="outline" className="w-full justify-start gap-2" asChild>
                                  <label htmlFor="image" className="cursor-pointer">
                                    <ImagePlus className="h-5 w-5"/>
                                    <span>{selectedFile ? 'Change photo' : 'Upload photo'}</span>
                                  </label>
                                </Button>
                               <Input id="image" name="image" type="file" className="hidden" accept="image/*" onChange={handleFileChange} ref={fileInputRef} />
                           </div>
                           <div className="space-y-2">
                               <Label>Record a voice note</Label>
                               {isRecording ? (
                                <Button variant="destructive" className="w-full justify-start gap-2" onClick={handleStopRecording} type="button">
                                   <Square className="h-5 w-5"/>
                                   <span>Stop Recording</span>
                               </Button>
                               ) : (
                               <Button variant="outline" className="w-full justify-start gap-2" onClick={handleStartRecording} type="button">
                                   <Mic className="h-5 w-5"/>
                                   <span>Start Recording</span>
                               </Button>
                               )}
                           </div>
                        </div>
                         {micPermission === false && (
                            <Alert variant="destructive">
                                <AlertCircle className="h-4 w-4" />
                                <AlertTitle>Microphone Access Denied</AlertTitle>
                                <AlertDescription>
                                    To record a voice note, please enable microphone permissions in your browser settings and refresh the page.
                                </AlertDescription>
                            </Alert>
                        )}
                        {previewUrl && selectedFile && (
                            <div className="space-y-2">
                                <Label>Photo Preview</Label>
                                <div className="relative group">
                                  <Image src={previewUrl} alt="Preview" width={400} height={400} className="rounded-lg w-full h-auto object-cover"/>
                                  <Button variant="destructive" size="icon" className="absolute top-2 right-2 h-6 w-6 opacity-50 group-hover:opacity-100 transition-opacity" onClick={handleRemoveFile}>
                                    <X className="h-4 w-4"/>
                                  </Button>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-muted-foreground border rounded-md p-2">
                                  <Paperclip className="h-4 w-4"/>
                                  <span>{selectedFile.name}</span>
                                  <span className="ml-auto">{Math.round(selectedFile.size / 1024)} KB</span>
                                </div>
                            </div>
                        )}
                         {audioUrl && (
                            <div className="space-y-2">
                                <Label>Voice Note Preview</Label>
                                <div className="relative group">
                                    <audio src={audioUrl} controls className="w-full" />
                                    <Button variant="destructive" size="icon" className="absolute top-2 right-2 h-6 w-6 opacity-50 group-hover:opacity-100 transition-opacity" onClick={handleRemoveAudio}>
                                        <X className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                    <DialogFooter className="pt-4 flex-shrink-0">
                        <DialogClose asChild>
                            <Button type="button" variant="secondary" onClick={resetForm}>
                                Cancel
                            </Button>
                        </DialogClose>
                        <Button type="submit" disabled={isSaving}>
                            {isSaving ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                'Save Memory'
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
      </div>

      <div className="mt-6">
        {isLoading ? (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        ) : memories.length === 0 ? (
            <Card className="flex flex-col items-center justify-center h-64 text-center p-6">
                <Box className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold">Your Memory Box is Empty</h3>
                <p className="text-muted-foreground mt-2">Click on the "Upload a Memory" button to save your first keepsake.</p>
            </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {memories.map((memory) => (
              <Card key={memory.id} className="overflow-hidden group cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setSelectedMemory(memory)}>
                <CardContent className="p-0 aspect-square">
                  {renderCardContent(memory)}
                </CardContent>
                <div className="p-4 border-t">
                    <h3 className="font-semibold truncate">{memory.title}</h3>
                    <p className="text-xs text-muted-foreground">{memory.createdAt as string}</p>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {selectedMemory && (
        <Dialog open={!!selectedMemory} onOpenChange={(isOpen) => { if (!isOpen) setSelectedMemory(null); }}>
          <DialogContent className="sm:max-w-xl max-h-[90vh] flex flex-col">
            <DialogHeader>
              <DialogTitle>{selectedMemory.title}</DialogTitle>
              <DialogDescription>{selectedMemory.createdAt as string}</DialogDescription>
            </DialogHeader>
            <div className="flex-grow overflow-y-auto pr-4 -mr-4 space-y-4 py-4">
              {selectedMemory.imageUrl && (
                <div className="relative aspect-video">
                  <Image src={selectedMemory.imageUrl} alt={selectedMemory.title} layout="fill" objectFit="contain" className="rounded-lg" />
                </div>
              )}
              {selectedMemory.text && (
                <p className="text-sm whitespace-pre-wrap">{selectedMemory.text}</p>
              )}
              {selectedMemory.voiceNoteUrl && (
                <div>
                  <Label>Voice Note</Label>
                  <audio controls src={selectedMemory.voiceNoteUrl} className="w-full mt-2">
                    Your browser does not support the audio element.
                  </audio>
                </div>
              )}
            </div>
            <DialogFooter className="pt-4 flex-shrink-0">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" disabled={isDeleting}>
                    {isDeleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />}
                    Delete
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete this memory.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={() => handleDelete(selectedMemory.id)}>
                      Continue
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
              <DialogClose asChild>
                <Button variant="outline">Close</Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
