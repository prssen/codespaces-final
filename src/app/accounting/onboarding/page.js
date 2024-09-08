import { OnboardingDialog } from "./OnboardingDialog";
import CompanyFlow from "./CompanyFlow";

// Must be a server action to be passed to a client component
const noop = async () => {
    "use server"
    return;
}

const OnboardingPage = () => {
    return (
        <div
            style={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                flex: 1,
                height: '100vh',
                border: 2,
                borderColor: 'pink'
            }}
        >
            {/* Dialog is always open on this page */}
            <OnboardingDialog
                open={true}
                handleClose={noop}
                // startTransition={startTransition}
                // ChildComponent={(props) => <CompanyFlow {...props} />}
                ChildComponent={CompanyFlow}
            />
        </div>
    );
}

export default OnboardingPage;