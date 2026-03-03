import { doSignIn } from "@/app/actions/auth"
import { Button } from "@/components/ui/button"

export function SignIn() {
    return (
        <form action={doSignIn}>
            <Button type="submit" variant="default" size="sm">
                Sign in with Google
            </Button>
        </form>
    )
}
