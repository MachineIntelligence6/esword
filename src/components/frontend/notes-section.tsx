'use client'
import { Button } from "@/components/ui/button";
import { useReadBookStore } from "@/lib/zustand/readBookStore";
import QuillEditor from "../ui/editor";
import { useState } from "react";
import {
    AlertDialog, AlertDialogCancel, AlertDialogContent,
    AlertDialogDescription, AlertDialogFooter,
    AlertDialogHeader, AlertDialogTitle
} from "../ui/alert-dialog";
import Spinner from "../spinner";
import clientApiHandlers from "@/client/handlers";
import { useSession } from "next-auth/react";
import { useToast } from "../ui/use-toast";
import definedMessages from "@/shared/constants/messages";





export default function NotesContentComponent() {
    const { data: session } = useSession()
    const {
        activeBook, activeChapter, activeVerse,
        activeVerseNote,
        setActiveVerseNote
    } = useReadBookStore()

    const [savingNote, setSavingNote] = useState(false);
    const { toast } = useToast()



    const saveNote = async () => {
        if (!activeVerseNote || !session || !activeVerse.data) return;
        setSavingNote(true)
        const res = await clientApiHandlers.notes.create({
            verse: activeVerse.data.id,
            text: activeVerseNote.text ?? ""
        })

        if (res.succeed) {
            toast({
                title: "Notes saved successfully.",
            })
        } else {
            toast({
                title: "Error",
                description: definedMessages.UNKNOWN_ERROR
            })
        }
        setSavingNote(false)
    }


    const discardNote = () => {
        setActiveVerseNote(undefined)
    }



    return (
        <div className="flex flex-col h-auto min-h-full
        ">
            <div
                className="toggle-btn bg-silver-light py-3 font-inter lg:pl-3 pl-[10px] pr-[19px] lg:border-0 border-b lg:flex justify-between hidden">
                <h3 className="text-xs font-bold ">
                    NOTES
                </h3>
            </div>
            <div className="lg:block">
                <div className="border-b">
                    <div className="flex items-center justify-between mx-3 my-1 gap-3">
                        {
                            activeBook.data && activeChapter.data ?
                                <Button variant={"secondary"} className="text-xs bg-secondary hover:scale-110 transition-all" type="button">
                                    {activeBook.data?.name} {activeChapter.data?.name}:{activeVerse.data?.number}
                                </Button>
                                :
                                <span></span>
                        }
                        {
                            <Button
                                className="text-sm" type="button"
                                onClick={saveNote}
                                disabled={savingNote || !activeVerseNote.changed || !activeVerse.data || !activeVerseNote.text}
                            >
                                {
                                    savingNote ?
                                        <Spinner className="border-white" />
                                        :
                                        <span>Save</span>
                                }
                            </Button>
                        }
                    </div>
                </div>
                {/* <Editor /> */}
                <div className="flex w-full h-full">
                    <QuillEditor
                        readOnly={activeVerse.loading || !activeVerse.data}
                        onChange={(value) => setActiveVerseNote(value)}
                        value={activeVerseNote.text} />
                </div>
            </div>
        </div>
    )
}





type PopupProps = {
    open: boolean;
    setOpen: (value: boolean) => void;
}

export function NoteWarningPopupOpen({ open, setOpen }: PopupProps) {
    const { data: session } = useSession();
    const [processing, setProcessing] = useState(false);
    const { activeVerseNote, activeVerse, setActiveVerseNote } = useReadBookStore()
    const { toast } = useToast()


    const saveNote = async () => {
        if (!activeVerseNote || !session || !activeVerse.data) return;
        setProcessing(true)
        const res = await clientApiHandlers.notes.create({
            verse: activeVerse.data.id,
            text: activeVerseNote.text ?? ""
        })

        if (res.succeed) {
            toast({
                title: "Notes saved successfully.",
            })
            setOpen(false)
        } else {
            toast({
                title: "Error",
                description: definedMessages.UNKNOWN_ERROR
            })
        }
        setProcessing(false)
    }


    const discardNote = () => {
        setActiveVerseNote(undefined)
    }

    return (
        <AlertDialog open={open} onOpenChange={setOpen}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Warning</AlertDialogTitle>
                    <AlertDialogDescription>
                        You have unsaved notes linked with this verse.
                        <br />
                        Changing verse will delete unsaved notes.
                        <br />
                        Do you want to save changes?
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={processing} onClick={discardNote}>
                        Discard
                    </AlertDialogCancel>
                    <Button onClick={saveNote} disabled={processing}>
                        {
                            processing ?
                                <Spinner className="border-white" />
                                :
                                <span>Save</span>
                        }
                    </Button>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}
