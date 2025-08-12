import type { BoardState, WSStatus as WSStatusT } from "@/types"; // tipe2
import { WSStatus } from "@/types/state";                         // nilai

// ...
const [status, setStatus] = useState<WSStatusT>(WSStatus.CONNECTING);
// setStatus(WSStatus.OPEN) / CLOSED / ERROR sesuai event
