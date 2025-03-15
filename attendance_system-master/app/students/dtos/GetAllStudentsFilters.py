from typing import Optional

class GetAllStudentsFilters:
    is_male:bool = True
    name: Optional[str]
    seq_number : Optional[int]
    faculty : Optional[str]
    national_id : Optional[str]
    page_number : Optional[int] = 1
    page_size : Optional[int] = 10