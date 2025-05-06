import axios from "axios"
import { API_BASE_URL } from "../api/api";
import { toast } from "react-toastify";


export const getUserProfileData = async (token) => {
    try {
        const res = await axios.get(
          `${API_BASE_URL}/api/team/getUserFromToken`,
          {
            headers: { "x-auth-token": token },
          }
        );
        return res.data;
      } catch (err) {
        console.error(err);
        toast.error("Failed to fetch user profile");
      }
}