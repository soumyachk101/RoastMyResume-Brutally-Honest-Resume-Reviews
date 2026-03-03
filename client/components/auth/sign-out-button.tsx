import { doSignOut } from "@/app/actions/auth"
import { Button } from "@/components/ui/button"

export function SignOut() {
    return (
        <form action={doSignOut}>
            <Button type="submit" variant="ghost" className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-500/10">
                Sign Out
            </Button>
        </form>
    )
}
